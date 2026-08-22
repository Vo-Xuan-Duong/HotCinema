package com.example.cinema.dto.auth;

import java.util.UUID;

public record AuthResponse(
        UUID userId,
        String accessToken,
        String refreshToken
) {
    public AuthResponse(String accessToken, String refreshToken) {
        this(null, accessToken, refreshToken);
    }
}
