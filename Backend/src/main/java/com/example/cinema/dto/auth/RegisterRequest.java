package com.example.cinema.dto.auth;

public record RegisterRequest(
        String email,
        String fullName,
        String phone,
        String password,
        String confirmPassword
) {
}
