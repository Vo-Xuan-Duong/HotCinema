package com.example.cinema.dto.refreshtoken;

import jakarta.validation.constraints.*;

import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefreshTokenUpdateRequest {

    private java.util.UUID userId;
    @NotBlank
    private String tokenHash;
    @NotNull
    private ZonedDateTime expiresAt;
    @NotNull
    private ZonedDateTime revokedAt;
    @NotBlank
    private String ipAddress;
    @NotBlank
    private String userAgent;
}
