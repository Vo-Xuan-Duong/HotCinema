package com.example.cinema.controller;

import com.example.cinema.entity.SeatType;
import com.example.cinema.service.SeatTypeService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.SeatTypeMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.seattype.SeatTypeCreateRequest;
import com.example.cinema.dto.seattype.SeatTypeUpdateRequest;
import com.example.cinema.dto.seattype.SeatTypeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/seattypes")
public class SeatTypeController {

    private final SeatTypeService seatTypeService;
    private final SeatTypeMapper seatTypeMapper;

    public SeatTypeController(SeatTypeService seatTypeService, SeatTypeMapper seatTypeMapper) {
        this.seatTypeService = seatTypeService;
        this.seatTypeMapper = seatTypeMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<SeatTypeResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<SeatType> pageResult = seatTypeService.findAll(pageable);
        Page<SeatTypeResponse> responsePage = pageResult.map(seatTypeMapper::toResponse);
        PageResponse<SeatTypeResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatTypeResponse>> getById(@PathVariable UUID id) {
        SeatTypeResponse res = seatTypeService.findById(id)
                .map(seatTypeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("SeatType", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SeatTypeResponse>> create(@Valid @RequestBody SeatTypeCreateRequest request) {
        SeatType entity = seatTypeMapper.toEntity(request);
        SeatType saved = seatTypeService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(seatTypeMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SeatTypeResponse>> update(@PathVariable UUID id, @Valid @RequestBody SeatTypeUpdateRequest request) {
        SeatType existing = seatTypeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeatType", id.toString()));
        seatTypeMapper.updateEntityFromRequest(request, existing);
        SeatType saved = seatTypeService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(seatTypeMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        seatTypeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SeatType", id.toString()));
        seatTypeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}