package com.example.cinema.controller;

import com.example.cinema.service.SeatService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.seat.SeatCreateRequest;
import com.example.cinema.dto.seat.SeatUpdateRequest;
import com.example.cinema.dto.seat.SeatResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(seatService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<SeatResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(seatService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(seatService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeatResponse>> create(@Valid @RequestBody SeatCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(seatService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> update(@PathVariable UUID id, @Valid @RequestBody SeatUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(seatService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        seatService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
