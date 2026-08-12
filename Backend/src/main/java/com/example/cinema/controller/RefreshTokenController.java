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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

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
    public ResponseEntity<ApiResponse<PageResponse<RefreshTokenResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<RefreshToken> pageResult = refreshTokenService.findAll(pageable);
        Page<RefreshTokenResponse> responsePage = pageResult.map(refreshTokenMapper::toResponse);
        PageResponse<RefreshTokenResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
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