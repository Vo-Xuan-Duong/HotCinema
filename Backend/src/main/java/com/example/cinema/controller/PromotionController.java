package com.example.cinema.controller;

import com.example.cinema.service.PromotionService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
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

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
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
        return ResponseEntity.ok(new ApiResponse<>(promotionService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> create(@Valid @RequestBody PromotionCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(promotionService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> update(@PathVariable UUID id, @Valid @RequestBody PromotionUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(promotionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        promotionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
