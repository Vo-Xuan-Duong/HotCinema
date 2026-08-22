package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.RefreshToken;
import com.example.cinema.dto.refreshtoken.RefreshTokenResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenService {
    List<RefreshTokenResponse> findAll();
    PageResponse<RefreshTokenResponse> findPage(Pageable pageable);
    Optional<RefreshToken> findById(UUID id);
    RefreshToken save(RefreshToken entity);
    void deleteById(UUID id);
}
