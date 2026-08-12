package com.example.cinema.dto.user;

import jakarta.validation.constraints.*;

import java.time.ZonedDateTime;

import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    @NotBlank

    private String email;
    @NotBlank
    private String phone;
    @NotBlank
    private String fullName;
    @NotNull
    private LocalDate dateOfBirth;
    @NotNull
    private Gender gender;
    @NotBlank
    private String avatarUrl;
    @NotNull
    private UserStatus status;
    @NotNull
    private Boolean emailVerified;
    @NotNull
    private Boolean phoneVerified;
    @NotNull
    private ZonedDateTime lastLoginAt;
}
