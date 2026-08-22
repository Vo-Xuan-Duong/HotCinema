package com.example.cinema.controller;

import com.example.cinema.service.AuditLogService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
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

    public AuditLogController(AuditLogService auditLogService) {
        this.auditLogService = auditLogService;
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
        return ResponseEntity.ok(new ApiResponse<>(auditLogService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<AuditLogResponse>> create(@Valid @RequestBody AuditLogCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(auditLogService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AuditLogResponse>> update(@PathVariable UUID id, @Valid @RequestBody AuditLogUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(auditLogService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        auditLogService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
