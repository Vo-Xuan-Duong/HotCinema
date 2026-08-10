package com.example.cinema.service;

import com.example.cinema.entity.AuditLog;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuditLogService {
    List<AuditLog> findAll();
    Optional<AuditLog> findById(UUID id);
    AuditLog save(AuditLog entity);
    void deleteById(UUID id);
}
