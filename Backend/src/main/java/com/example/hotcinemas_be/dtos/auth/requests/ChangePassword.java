package com.example.hotcinemas_be.dtos.auth.requests;

import lombok.Builder;

@Builder
public record NewPassword(String newPassword, String email, String otpCode) {
    public String getNewPassword() {
        return newPassword;
    }

    public String getEmail() {
        return email;
    }

    public String getOtpCode() {
        return otpCode;
    }
}
