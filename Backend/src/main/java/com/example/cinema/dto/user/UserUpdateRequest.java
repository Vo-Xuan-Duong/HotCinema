package com.example.cinema.dto.user;

import com.example.cinema.entity.enums.Gender;
import com.example.cinema.entity.enums.UserStatus;
import jakarta.validation.constraints.Email;
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
public class UserUpdateRequest {

    @Email
    private String email;

    @Size(max = 30)
    private String phone;

    @Size(max = 150)
    private String fullName;

    private LocalDate dateOfBirth;
    private Gender gender;
    private String avatarUrl;
    private UserStatus status;
    private Boolean emailVerified;
    private Boolean phoneVerified;
    private String roleCode;
}
