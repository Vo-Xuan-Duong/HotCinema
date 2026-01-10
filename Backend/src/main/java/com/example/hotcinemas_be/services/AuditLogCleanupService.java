package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.repositorys.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogCleanupService {

    private final AuditLogRepository auditLogRepository;

    // Run every day at 1:00 AM
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void cleanupOldAuditLogs() {
        LocalDateTime expiryDate = LocalDateTime.now().minusMonths(6);
        log.info("Starting audit log cleanup. Deleting logs created before {}", expiryDate);

        try {
            auditLogRepository.deleteByCreatedAtBefore(expiryDate);
            log.info("Audit log cleanup finished successfully.");
        } catch (Exception e) {
            log.error("Failed to cleanup audit logs", e);
        }
    }
}
