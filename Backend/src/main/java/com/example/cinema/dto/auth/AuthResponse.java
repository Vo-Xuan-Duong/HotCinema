package com.example.cinema.dto.auth;

public record AuthResponse(
        String accessToken,
        String refreshToken
) {
}
