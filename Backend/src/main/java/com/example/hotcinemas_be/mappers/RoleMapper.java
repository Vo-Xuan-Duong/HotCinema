package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.role.responses.RoleResponse;
import com.example.hotcinemas_be.models.Role;
import org.springframework.stereotype.Service;

@Service
public class RoleMapper {
    private final PermissionMapper permissionMapper;

    public RoleMapper(PermissionMapper permissionMapper) {
        this.permissionMapper = permissionMapper;
    }

    public RoleResponse mapToResponse(Role role) {
        if (role == null) {
            return null;
        }
        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isActive(role.getIsActive())
                .permissions(role.getRolePermissions().stream()
                        .map(rolePermission -> permissionMapper.mapToResponse(rolePermission.getPermission()))
                        .toList())
                .build();
    }
}
