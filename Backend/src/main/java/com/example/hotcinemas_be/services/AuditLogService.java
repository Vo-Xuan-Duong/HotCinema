package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.models.AuditLog;
import com.example.hotcinemas_be.repositorys.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void saveAuditLog(AuditLog auditLog) {
        auditLogRepository.save(auditLog);
    }
}
