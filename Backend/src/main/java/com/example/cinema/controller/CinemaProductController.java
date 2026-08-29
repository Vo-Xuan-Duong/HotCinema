package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import com.example.cinema.service.CinemaProductService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cinemaproducts")
public class CinemaProductController {

    private final CinemaProductService cinemaProductService;

    public CinemaProductController(CinemaProductService cinemaProductService) {
        this.cinemaProductService = cinemaProductService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CinemaProductResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductService.findAll()));
    }

    @GetMapping("/cinema/{cinemaId}/available")
    public ResponseEntity<ApiResponse<List<CinemaProductResponse>>> getAvailableByCinema(
            @PathVariable UUID cinemaId) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductService.findAvailableByCinema(cinemaId)));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<CinemaProductResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaProductResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CinemaProductResponse>> create(
            @Valid @RequestBody CinemaProductCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CinemaProductResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody CinemaProductUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cinemaProductService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
