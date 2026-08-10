package com.example.cinema.dto.user;

import java.util.UUID;

import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import java.time.LocalDate;
import java.time.ZonedDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private java.util.UUID id;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    private String email;
    private String phone;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String avatarUrl;
    private UserStatus status;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private ZonedDateTime lastLoginAt;
    private ZonedDateTime deletedAt;
}
