package com.example.cinema.service;

import com.example.cinema.entity.RefreshToken;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenService {
    List<RefreshToken> findAll();
    Optional<RefreshToken> findById(UUID id);
    RefreshToken save(RefreshToken entity);
    void deleteById(UUID id);
}
