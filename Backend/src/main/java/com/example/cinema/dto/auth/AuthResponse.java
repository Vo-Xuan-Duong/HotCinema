package com.example.cinema.dto.auth;

public record AuthResponse(
        UUID userId,
        String accessToken,
        String refreshToken
) {
}
