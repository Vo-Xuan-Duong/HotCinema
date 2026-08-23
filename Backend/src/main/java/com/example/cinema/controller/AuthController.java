package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.dto.auth.AuthResponse;
import com.example.cinema.dto.auth.LoginRequest;
import com.example.cinema.dto.auth.RegisterRequest;
import com.example.cinema.dto.auth.ResendOtpRequest;
import com.example.cinema.dto.auth.VerifyOtpRequest;
import com.example.cinema.dto.auth.ForgotPasswordRequest;
import com.example.cinema.dto.auth.ResetPasswordRequest;
import com.example.cinema.dto.auth.ChangePasswordRequest;
import com.example.cinema.dto.auth.RefreshTokenRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auths")
public class AuthController {
    private final AuthService authService;

    public AuthController (AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(
                new ApiResponse<>(authService.register(request))
        );
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login (@RequestBody LoginRequest loginRequest){
        return ResponseEntity.ok(
                new ApiResponse<>(authService.login(loginRequest))
        );
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(authService.refresh(request)));
    }

    @GetMapping({"/me", "/verify"})
    public ResponseEntity<ApiResponse<UserResponse>> currentUser(@AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(authService.currentUser(UUID.fromString(Objects.requireNonNull(jwt.getSubject())))));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@AuthenticationPrincipal Jwt jwt) {
        authService.logout(jwt.getId(), jwt.getExpiresAt());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<UserResponse>> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(authService.verifyOtp(request)));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<Void> resendOtp(@Valid @RequestBody ResendOtpRequest request) {
        authService.resendOtp(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/verify-password-otp")
    public ResponseEntity<Void> verifyPasswordOtp(@Valid @RequestBody VerifyOtpRequest request) {
        authService.verifyPasswordOtp(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        authService.changePassword(UUID.fromString(Objects.requireNonNull(jwt.getSubject())), request);
        return ResponseEntity.noContent().build();
    }

}
