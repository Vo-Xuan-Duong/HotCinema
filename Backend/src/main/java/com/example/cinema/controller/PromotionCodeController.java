package com.example.cinema.controller;

import com.example.cinema.entity.PromotionCode;
import com.example.cinema.service.PromotionCodeService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.PromotionCodeMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final PromotionCodeMapper promotionCodeMapper;

    public PromotionCodeController(PromotionCodeService promotionCodeService, PromotionCodeMapper promotionCodeMapper) {
        this.promotionCodeService = promotionCodeService;
        this.promotionCodeMapper = promotionCodeMapper;
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
        PromotionCodeResponse res = promotionCodeService.findById(id)
                .map(promotionCodeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PromotionCode", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PromotionCodeResponse>> create(@Valid @RequestBody PromotionCodeCreateRequest request) {
        PromotionCode entity = promotionCodeMapper.toEntity(request);
        PromotionCode saved = promotionCodeService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionCodeResponse>> update(@PathVariable UUID id, @Valid @RequestBody PromotionCodeUpdateRequest request) {
        PromotionCode existing = promotionCodeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PromotionCode", id.toString()));
        promotionCodeMapper.updateEntityFromRequest(request, existing);
        PromotionCode saved = promotionCodeService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(promotionCodeMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        promotionCodeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PromotionCode", id.toString()));
        promotionCodeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
