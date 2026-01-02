package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.user.responses.UserResponse;
import com.example.hotcinemas_be.models.User;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {

    public UserResponse mapToResponse(User user) {
        if (user == null) {
            return null;
        }
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .password(user.getPassword() != null ? user.getPassword() : null)
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .address(user.getAddress())
                .avatarUrl(user.getAvatarUrl())
                .dateOfBirth(user.getDateOfBirth())
                .role(user.getRole() != null ? user.getRole().getName() : null)
                .loyaltyPoints(user.getLoyaltyPoints())
                .membershipTier(user.getMembershipTier())
                .lastLogin(user.getLastLogin())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
