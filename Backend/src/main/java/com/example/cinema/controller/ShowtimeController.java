package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.service.ShowtimeSeatService;
import com.example.cinema.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;
    private final ShowtimeSeatService showtimeSeatService;

    public ShowtimeController(ShowtimeService showtimeService, ShowtimeSeatService showtimeSeatService) {
        this.showtimeService = showtimeService;
        this.showtimeSeatService = showtimeSeatService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ShowtimeResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.findPage(pageable)));
    }

    @GetMapping("/{id}/seats")
    public ResponseEntity<ApiResponse<List<ShowtimeSeatResponse>>> getSeats(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatService.findByShowtime(id)));
    }

    @PostMapping("/{id}/lock-seat/{seatId}")
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> lockSeat(
            @PathVariable UUID id,
            @PathVariable UUID seatId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(
                showtimeSeatService.holdSeat(id, seatId, currentUserId(jwt))
        ));
    }

    @PostMapping("/{id}/unlock-seat/{seatId}")
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> unlockSeat(
            @PathVariable UUID id,
            @PathVariable UUID seatId,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(
                showtimeSeatService.releaseSeat(id, seatId, currentUserId(jwt))
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeResponse>> create(@Valid @RequestBody ShowtimeCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody ShowtimeUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }
}
