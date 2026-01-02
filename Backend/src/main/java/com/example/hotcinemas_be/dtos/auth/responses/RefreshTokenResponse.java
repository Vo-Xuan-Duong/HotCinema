package com.example.hotcinemas_be.dtos.auth.responses;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RefreshTokenResponse {
    private Long id;
    private String token;
    private LocalDateTime createdAt;
}

