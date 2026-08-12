package com.example.cinema.service;

import com.example.cinema.entity.AuditLog;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface AuditLogService {
    Page<AuditLog> findAll(Pageable pageable);
    Optional<AuditLog> findById(UUID id);
    AuditLog save(AuditLog entity);
    void deleteById(UUID id);
}
