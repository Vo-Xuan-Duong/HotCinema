package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.refreshtoken.RefreshTokenCreateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenUpdateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface RefreshTokenService {
    List<RefreshTokenResponse> findAll();
    PageResponse<RefreshTokenResponse> findPage(Pageable pageable);
    RefreshTokenResponse findById(UUID id);
    RefreshTokenResponse create(RefreshTokenCreateRequest request);
    RefreshTokenResponse update(UUID id, RefreshTokenUpdateRequest request);
    void deleteById(UUID id);
}
