package com.example.cinema.service.impl;

import com.example.cinema.entity.AuditLog;
import com.example.cinema.repository.AuditLogRepository;
import com.example.cinema.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "auditlogs", key = "#id")
    public Optional<AuditLog> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditlogs", key = "#result.id")
    public AuditLog save(AuditLog entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditlogs", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
