package com.example.hotcinemas_be.dtos.role.responses;

import com.example.hotcinemas_be.dtos.permission.responses.PermissionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;
import java.util.Set;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoleResponse {
    private Long id;
    private String name;
    private String description;
    private Instant permissionCount;
    private Boolean isActive;
    private List<PermissionResponse> permissions;
}


























