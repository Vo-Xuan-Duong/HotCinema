package com.example.hotcinemas_be.repositorys;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.hotcinemas_be.models.RefreshToken;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken,Long> {
    Optional<RefreshToken> findByToken(String refreshToken);
}
