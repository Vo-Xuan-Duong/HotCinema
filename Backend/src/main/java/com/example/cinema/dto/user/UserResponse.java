package com.example.cinema.dto.user;

import com.example.cinema.dto.role.RoleResponse;
import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
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

    @Builder.Default
    private Set<RoleResponse> roles = new HashSet<>();
}
