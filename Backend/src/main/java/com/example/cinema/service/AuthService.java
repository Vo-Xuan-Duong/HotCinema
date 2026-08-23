package com.example.cinema.service;

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

import java.time.Instant;
import java.util.UUID;

public interface AuthService {
    AuthResponse login(LoginRequest loginRequest);
    AuthResponse refresh(RefreshTokenRequest request);
    UserResponse currentUser(UUID userId);
    UserResponse register(RegisterRequest registerRequest);
    UserResponse verifyOtp(VerifyOtpRequest request);
    void resendOtp(ResendOtpRequest request);
    void forgotPassword(ForgotPasswordRequest request);
    void verifyPasswordOtp(VerifyOtpRequest request);
    void resetPassword(ResetPasswordRequest request);
    void changePassword(UUID userId, ChangePasswordRequest request);
    void logout(String tokenId, Instant expiresAt);
}
