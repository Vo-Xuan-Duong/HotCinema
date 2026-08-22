package com.example.cinema.controller;

import com.example.cinema.entity.Seat;
import com.example.cinema.service.SeatService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.SeatMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final SeatMapper seatMapper;

    public SeatController(SeatService seatService, SeatMapper seatMapper) {
        this.seatService = seatService;
        this.seatMapper = seatMapper;
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
        SeatResponse res = seatService.findById(id)
                .map(seatMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeatResponse>> create(@Valid @RequestBody SeatCreateRequest request) {
        Seat entity = seatMapper.toEntity(request);
        Seat saved = seatService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(seatMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatResponse>> update(@PathVariable UUID id, @Valid @RequestBody SeatUpdateRequest request) {
        Seat existing = seatService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", id.toString()));
        seatMapper.updateEntityFromRequest(request, existing);
        Seat saved = seatService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(seatMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        seatService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", id.toString()));
        seatService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
