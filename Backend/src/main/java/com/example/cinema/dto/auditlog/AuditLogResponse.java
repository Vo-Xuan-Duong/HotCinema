package com.example.cinema.dto.auditlog;

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
public class AuditLogResponse {

    private UUID id;
    private java.util.UUID userId;
    private String action;
    private String entityType;
    private UUID entityId;
    private String oldData;
    private String newData;
    private String ipAddress;
    private String userAgent;
    private ZonedDateTime createdAt;
}
