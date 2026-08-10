package com.example.cinema.mapper;

import com.example.cinema.dto.auditlog.AuditLogCreateRequest;
import com.example.cinema.dto.auditlog.AuditLogUpdateRequest;
import com.example.cinema.dto.auditlog.AuditLogResponse;
import com.example.cinema.entity.AuditLog;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface AuditLogMapper {

    AuditLog toEntity(AuditLogCreateRequest request);

    AuditLogResponse toResponse(AuditLog entity);

    List<AuditLogResponse> toResponseList(List<AuditLog> entities);

    void updateEntityFromRequest(AuditLogUpdateRequest request, @MappingTarget AuditLog entity);
}
