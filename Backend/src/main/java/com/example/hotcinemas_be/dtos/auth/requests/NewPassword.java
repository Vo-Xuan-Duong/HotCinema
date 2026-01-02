package com.example.hotcinemas_be.dtos.auth.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class NewPassword {
    private String newPassword;
}

