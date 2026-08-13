package com.example.cinema.service;

import com.example.cinema.dto.auth.AuthResponse;
import com.example.cinema.dto.auth.LoginRequest;
import com.example.cinema.dto.auth.RegisterRequest;
import com.example.cinema.dto.user.UserResponse;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    UserResponse register(RegisterRequest registerRequest);

}
