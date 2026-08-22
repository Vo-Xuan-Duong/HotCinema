package com.example.cinema.controller;

import com.example.cinema.service.CinemaService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.cinema.CinemaCreateRequest;
import com.example.cinema.dto.cinema.CinemaUpdateRequest;
import com.example.cinema.dto.cinema.CinemaResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cinemas")
public class CinemaController {

    private final CinemaService cinemaService;

    public CinemaController(CinemaService cinemaService) {
        this.cinemaService = cinemaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(cinemaService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<CinemaResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(cinemaService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaResponse>> create(@Valid @RequestBody CinemaCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> update(@PathVariable UUID id, @Valid @RequestBody CinemaUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cinemaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
