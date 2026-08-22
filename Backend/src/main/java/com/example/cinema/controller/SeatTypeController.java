package com.example.cinema.controller;

import com.example.cinema.service.SeatTypeService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.seattype.SeatTypeCreateRequest;
import com.example.cinema.dto.seattype.SeatTypeUpdateRequest;
import com.example.cinema.dto.seattype.SeatTypeResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seattypes")
public class SeatTypeController {

    private final SeatTypeService seatTypeService;

    public SeatTypeController(SeatTypeService seatTypeService) {
        this.seatTypeService = seatTypeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SeatTypeResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(seatTypeService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<SeatTypeResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(seatTypeService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatTypeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(seatTypeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeatTypeResponse>> create(@Valid @RequestBody SeatTypeCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(seatTypeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatTypeResponse>> update(@PathVariable UUID id, @Valid @RequestBody SeatTypeUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(seatTypeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        seatTypeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
