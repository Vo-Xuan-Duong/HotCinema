package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    void deleteByCreatedAtBefore(LocalDateTime expiryDate);
}
