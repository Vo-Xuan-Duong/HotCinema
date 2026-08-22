package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.dto.auth.AuthResponse;
import com.example.cinema.dto.auth.RegisterRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auths")
public class AuthController {
    private final AuthService authService;

    public AuthController (AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(authService.register(request))
        );
    }

}
