package com.example.hotcinemas_be.dtos.user.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserUpdateRequest {
    @Size(max = 100, message = "Full name must not exceed 100 characters")
    private String fullName;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Phone number should be valid")
    private String phone;

    private String address;

    private String avatarUrl;

    private LocalDate dateOfBirth;

    private String role;
}

