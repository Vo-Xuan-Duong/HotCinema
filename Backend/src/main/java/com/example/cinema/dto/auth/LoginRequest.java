package com.example.cinema.dto.auth;

import com.example.cinema.service.AuthService;

public record LoginRequest(String email, String password){
}
