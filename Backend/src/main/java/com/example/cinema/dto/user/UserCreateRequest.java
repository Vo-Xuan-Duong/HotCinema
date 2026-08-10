package com.example.cinema.dto.user;

import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {

    private String email;
    private String phone;
    private String password;
    private String fullName;
    private LocalDate dateOfBirth;
    private Gender gender;
    private String avatarUrl;
    private UserStatus status;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private ZonedDateTime lastLoginAt;
}
