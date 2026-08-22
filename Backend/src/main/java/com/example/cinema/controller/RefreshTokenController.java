package com.example.cinema.controller;

import com.example.cinema.service.RefreshTokenService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
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

    public RefreshTokenController(RefreshTokenService refreshTokenService) {
        this.refreshTokenService = refreshTokenService;
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
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> create(@Valid @RequestBody RefreshTokenCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RefreshTokenResponse>> update(@PathVariable UUID id, @Valid @RequestBody RefreshTokenUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(refreshTokenService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        refreshTokenService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
