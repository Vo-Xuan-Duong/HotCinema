package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.permission.responses.PermissionResponse;
import com.example.hotcinemas_be.models.Permission;
import org.springframework.stereotype.Service;

@Service
public class PermissionMapper {

    public PermissionResponse mapToResponse(Permission permission) {
        if (permission == null) {
            return null;
        }
        return PermissionResponse.builder()
                .id(permission.getId())
                .name(permission.getName())
                .description(permission.getDescription())
                .module(permission.getModule())
                .createdAt(permission.getCreatedAt())
                .build();
    }
}
