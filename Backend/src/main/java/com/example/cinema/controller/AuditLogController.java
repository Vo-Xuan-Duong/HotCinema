package com.example.cinema.controller;

import com.example.cinema.entity.AuditLog;
import com.example.cinema.service.AuditLogService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.AuditLogMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.auditlog.AuditLogCreateRequest;
import com.example.cinema.dto.auditlog.AuditLogUpdateRequest;
import com.example.cinema.dto.auditlog.AuditLogResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auditlogs")
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final AuditLogMapper auditLogMapper;

    public AuditLogController(AuditLogService auditLogService, AuditLogMapper auditLogMapper) {
        this.auditLogService = auditLogService;
        this.auditLogMapper = auditLogMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLogResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(auditLogService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<AuditLogResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(auditLogService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> getById(@PathVariable UUID id) {
        AuditLogResponse res = auditLogService.findById(id)
                .map(auditLogMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AuditLogResponse>> create(@Valid @RequestBody AuditLogCreateRequest request) {
        AuditLog entity = auditLogMapper.toEntity(request);
        AuditLog saved = auditLogService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(auditLogMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> update(@PathVariable UUID id, @Valid @RequestBody AuditLogUpdateRequest request) {
        AuditLog existing = auditLogService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", id.toString()));
        auditLogMapper.updateEntityFromRequest(request, existing);
        AuditLog saved = auditLogService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(auditLogMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        auditLogService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("AuditLog", id.toString()));
        auditLogService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
