package com.example.cinema.dto.auditlog;

import jakarta.validation.constraints.*;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogCreateRequest {

    private java.util.UUID userId;
    @NotBlank
    private String action;
    @NotBlank
    private String entityType;
    @NotNull
    private UUID entityId;
    @NotBlank
    private String oldData;
    @NotBlank
    private String newData;
    @NotBlank
    private String ipAddress;
    @NotBlank
    private String userAgent;
}
