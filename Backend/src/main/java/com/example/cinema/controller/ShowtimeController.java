package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.entity.enums.ShowtimeStatus;
import com.example.cinema.service.ShowtimeSeatService;
import com.example.cinema.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/showtimes")
public class ShowtimeController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "startTime", "endTime", "createdAt", "updatedAt", "status", "basePrice"
    );

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
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "startTime,desc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.findPage(toPageable(page, size, sort))));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> search(
            @RequestParam(required = false) UUID movieId,
            @RequestParam(required = false) UUID cinemaId,
            @RequestParam(required = false) UUID auditoriumId,
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) LocalDate fromDate,
            @RequestParam(required = false) LocalDate toDate,
            @RequestParam(required = false) ShowtimeStatus status) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.search(
                movieId, cinemaId, auditoriumId, date, fromDate, toDate, status
        )));
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

    private Pageable toPageable(int page, int size, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 200);
        String[] sortParts = sort == null ? new String[0] : sort.split(",", 2);
        String property = sortParts.length > 0 && ALLOWED_SORT_FIELDS.contains(sortParts[0])
                ? sortParts[0]
                : "startTime";
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, property));
    }
}
