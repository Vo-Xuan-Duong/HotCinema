package com.example.cinema.controller;

import com.example.cinema.service.AuditoriumService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.auditorium.AuditoriumCreateRequest;
import com.example.cinema.dto.auditorium.AuditoriumUpdateRequest;
import com.example.cinema.dto.auditorium.AuditoriumResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auditoriums")
public class AuditoriumController {

    private final AuditoriumService auditoriumService;

    public AuditoriumController(AuditoriumService auditoriumService) {
        this.auditoriumService = auditoriumService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditoriumResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(auditoriumService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<AuditoriumResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(auditoriumService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditoriumResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(auditoriumService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AuditoriumResponse>> create(@Valid @RequestBody AuditoriumCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(auditoriumService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditoriumResponse>> update(@PathVariable UUID id, @Valid @RequestBody AuditoriumUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(auditoriumService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        auditoriumService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
