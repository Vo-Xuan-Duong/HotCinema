package com.example.cinema.mapper;

import com.example.cinema.dto.role.RoleCreateRequest;
import com.example.cinema.dto.role.RoleUpdateRequest;
import com.example.cinema.dto.role.RoleResponse;
import com.example.cinema.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface RoleMapper {

    Role toEntity(RoleCreateRequest request);

    RoleResponse toResponse(Role entity);

    List<RoleResponse> toResponseList(List<Role> entities);

    void updateEntityFromRequest(RoleUpdateRequest request, @MappingTarget Role entity);
}
