package com.example.cinema.dto.user;

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
}
