package com.example.cinema.controller;

import com.example.cinema.service.ShowtimeService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    public ShowtimeController(ShowtimeService showtimeService) {
        this.showtimeService = showtimeService;
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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeResponse>> create(@Valid @RequestBody ShowtimeCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> update(@PathVariable UUID id, @Valid @RequestBody ShowtimeUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
