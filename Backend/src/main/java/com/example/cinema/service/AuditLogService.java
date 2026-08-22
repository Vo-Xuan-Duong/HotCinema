package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.auditlog.AuditLogCreateRequest;
import com.example.cinema.dto.auditlog.AuditLogUpdateRequest;
import com.example.cinema.dto.auditlog.AuditLogResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface AuditLogService {
    List<AuditLogResponse> findAll();
    PageResponse<AuditLogResponse> findPage(Pageable pageable);
    AuditLogResponse findById(UUID id);
    AuditLogResponse create(AuditLogCreateRequest request);
    AuditLogResponse update(UUID id, AuditLogUpdateRequest request);
    void deleteById(UUID id);
}
