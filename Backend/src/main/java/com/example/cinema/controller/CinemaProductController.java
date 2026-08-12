package com.example.cinema.controller;

import com.example.cinema.entity.CinemaProduct;
import com.example.cinema.service.CinemaProductService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.CinemaProductMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cinemaproducts")
public class CinemaProductController {

    private final CinemaProductService cinemaProductService;
    private final CinemaProductMapper cinemaProductMapper;

    public CinemaProductController(CinemaProductService cinemaProductService, CinemaProductMapper cinemaProductMapper) {
        this.cinemaProductService = cinemaProductService;
        this.cinemaProductMapper = cinemaProductMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<CinemaProductResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<CinemaProduct> pageResult = cinemaProductService.findAll(pageable);
        Page<CinemaProductResponse> responsePage = pageResult.map(cinemaProductMapper::toResponse);
        PageResponse<CinemaProductResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaProductResponse>> getById(@PathVariable UUID id) {
        CinemaProductResponse res = cinemaProductService.findById(id)
                .map(cinemaProductMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaProduct", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CinemaProductResponse>> create(@Valid @RequestBody CinemaProductCreateRequest request) {
        CinemaProduct entity = cinemaProductMapper.toEntity(request);
        CinemaProduct saved = cinemaProductService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CinemaProductResponse>> update(@PathVariable UUID id, @Valid @RequestBody CinemaProductUpdateRequest request) {
        CinemaProduct existing = cinemaProductService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaProduct", id.toString()));
        cinemaProductMapper.updateEntityFromRequest(request, existing);
        CinemaProduct saved = cinemaProductService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(cinemaProductMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        cinemaProductService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaProduct", id.toString()));
        cinemaProductService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}