package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.AuditLog;
import com.example.cinema.dto.auditlog.AuditLogResponse;
import com.example.cinema.mapper.AuditLogMapper;
import com.example.cinema.repository.AuditLogRepository;
import com.example.cinema.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository repository;
    private final AuditLogMapper auditLogMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AuditLogResponse> findAll() {
        return auditLogMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(auditLogMapper::toResponse));
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
