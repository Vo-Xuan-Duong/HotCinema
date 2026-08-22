package com.example.cinema.controller;

import com.example.cinema.service.PromotionCodeService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.promotioncode.PromotionCodeCreateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeUpdateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/promotioncodes")
public class PromotionCodeController {

    private final PromotionCodeService promotionCodeService;

    public PromotionCodeController(PromotionCodeService promotionCodeService) {
        this.promotionCodeService = promotionCodeService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionCodeResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<PromotionCodeResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionCodeResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionCodeResponse>> create(@Valid @RequestBody PromotionCodeCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionCodeResponse>> update(@PathVariable UUID id, @Valid @RequestBody PromotionCodeUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        promotionCodeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
