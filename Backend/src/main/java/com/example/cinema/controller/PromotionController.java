package com.example.cinema.controller;

import com.example.cinema.entity.Promotion;
import com.example.cinema.service.PromotionService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.PromotionMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.promotion.PromotionCreateRequest;
import com.example.cinema.dto.promotion.PromotionUpdateRequest;
import com.example.cinema.dto.promotion.PromotionResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/promotions")
public class PromotionController {

    private final PromotionService promotionService;
    private final PromotionMapper promotionMapper;

    public PromotionController(PromotionService promotionService, PromotionMapper promotionMapper) {
        this.promotionService = promotionService;
        this.promotionMapper = promotionMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(promotionService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<PromotionResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(promotionService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getById(@PathVariable UUID id) {
        PromotionResponse res = promotionService.findById(id)
                .map(promotionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> create(@Valid @RequestBody PromotionCreateRequest request) {
        Promotion entity = promotionMapper.toEntity(request);
        Promotion saved = promotionService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(promotionMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> update(@PathVariable UUID id, @Valid @RequestBody PromotionUpdateRequest request) {
        Promotion existing = promotionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id.toString()));
        promotionMapper.updateEntityFromRequest(request, existing);
        Promotion saved = promotionService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(promotionMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        promotionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id.toString()));
        promotionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
