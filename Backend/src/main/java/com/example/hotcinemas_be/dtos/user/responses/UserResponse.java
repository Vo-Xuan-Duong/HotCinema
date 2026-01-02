package com.example.hotcinemas_be.dtos.user.responses;

import com.example.hotcinemas_be.enums.MembershipTier;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String password;
    private String fullName;
    private String phone;
    private String address;
    private String avatarUrl;
    private LocalDate dateOfBirth;
    private String role;
    private Integer loyaltyPoints;
    private MembershipTier membershipTier;
    private LocalDateTime lastLogin;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}


























