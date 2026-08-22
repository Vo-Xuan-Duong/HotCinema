package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.AuditLog;
import com.example.cinema.dto.auditlog.AuditLogResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface AuditLogService {
    List<AuditLogResponse> findAll();
    PageResponse<AuditLogResponse> findPage(Pageable pageable);
    Optional<AuditLog> findById(UUID id);
    AuditLog save(AuditLog entity);
    void deleteById(UUID id);
}
