package com.example.cinema.dto.user;

import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserCreateRequest {

    @NotBlank
    @Email
    private String email;

    @Size(max = 30)
    private String phone;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @NotBlank
    @Size(max = 150)
    private String fullName;

    private LocalDate dateOfBirth;
    private Gender gender;
    private String avatarUrl;

    @NotNull
    private UserStatus status;

    private Boolean emailVerified;
    private Boolean phoneVerified;

    private String roleCode;
}
