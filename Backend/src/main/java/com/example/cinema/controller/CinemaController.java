package com.example.cinema.controller;

import com.example.cinema.entity.Cinema;
import com.example.cinema.service.CinemaService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.CinemaMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final CinemaMapper cinemaMapper;

    public CinemaController(CinemaService cinemaService, CinemaMapper cinemaMapper) {
        this.cinemaService = cinemaService;
        this.cinemaMapper = cinemaMapper;
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
        CinemaResponse res = cinemaService.findById(id)
                .map(cinemaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaResponse>> create(@Valid @RequestBody CinemaCreateRequest request) {
        Cinema entity = cinemaMapper.toEntity(request);
        Cinema saved = cinemaService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(cinemaMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaResponse>> update(@PathVariable UUID id, @Valid @RequestBody CinemaUpdateRequest request) {
        Cinema existing = cinemaService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", id.toString()));
        cinemaMapper.updateEntityFromRequest(request, existing);
        Cinema saved = cinemaService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(cinemaMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cinemaService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", id.toString()));
        cinemaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
