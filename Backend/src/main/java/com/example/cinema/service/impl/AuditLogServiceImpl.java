package com.example.cinema.service.impl;

import com.example.cinema.entity.AuditLog;
import com.example.cinema.repository.AuditLogRepository;
import com.example.cinema.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<AuditLog> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<AuditLog> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public AuditLog save(AuditLog entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
