package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.AuditLog;
import com.example.cinema.dto.auditlog.AuditLogCreateRequest;
import com.example.cinema.dto.auditlog.AuditLogUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
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
    public AuditLogResponse findById(UUID id) {
        return repository.findById(id)
                .map(auditLogMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditlogs", allEntries = true)
    public AuditLogResponse create(AuditLogCreateRequest request) {
        AuditLog entity = auditLogMapper.toEntity(request);
        return auditLogMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditlogs", allEntries = true)
    public AuditLogResponse update(UUID id, AuditLogUpdateRequest request) {
        AuditLog entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", id.toString()));
        auditLogMapper.updateEntityFromRequest(request, entity);
        return auditLogMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditlogs", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
