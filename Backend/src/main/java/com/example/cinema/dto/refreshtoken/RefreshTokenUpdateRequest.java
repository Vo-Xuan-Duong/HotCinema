package com.example.cinema.dto.refreshtoken;

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
    private String tokenHash;
    private ZonedDateTime expiresAt;
    private ZonedDateTime revokedAt;
    private String ipAddress;
    private String userAgent;
}
