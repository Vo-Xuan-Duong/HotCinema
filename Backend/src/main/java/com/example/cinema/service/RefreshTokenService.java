package com.example.cinema.service;

import com.example.cinema.entity.RefreshToken;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenService {
    Page<RefreshToken> findAll(Pageable pageable);
    Optional<RefreshToken> findById(UUID id);
    RefreshToken save(RefreshToken entity);
    void deleteById(UUID id);
}
