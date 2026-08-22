package com.example.cinema.controller;

import com.example.cinema.entity.RefreshToken;
import com.example.cinema.service.RefreshTokenService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.RefreshTokenMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.refreshtoken.RefreshTokenCreateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenUpdateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/refreshtokens")
public class RefreshTokenController {

    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenMapper refreshTokenMapper;

    public RefreshTokenController(RefreshTokenService refreshTokenService, RefreshTokenMapper refreshTokenMapper) {
        this.refreshTokenService = refreshTokenService;
        this.refreshTokenMapper = refreshTokenMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RefreshTokenResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<RefreshTokenResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> getById(@PathVariable UUID id) {
        RefreshTokenResponse res = refreshTokenService.findById(id)
                .map(refreshTokenMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> create(@Valid @RequestBody RefreshTokenCreateRequest request) {
        RefreshToken entity = refreshTokenMapper.toEntity(request);
        RefreshToken saved = refreshTokenService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> update(@PathVariable UUID id, @Valid @RequestBody RefreshTokenUpdateRequest request) {
        RefreshToken existing = refreshTokenService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", id.toString()));
        refreshTokenMapper.updateEntityFromRequest(request, existing);
        RefreshToken saved = refreshTokenService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        refreshTokenService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", id.toString()));
        refreshTokenService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
