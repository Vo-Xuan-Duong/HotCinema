package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.permission.requests.PermissionRequest;
import com.example.hotcinemas_be.dtos.permission.responses.PermissionResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.PermissionMapper;
import com.example.hotcinemas_be.models.Permission;
import com.example.hotcinemas_be.models.RolePermission;
import com.example.hotcinemas_be.repositorys.PermissionRepository;
import com.example.hotcinemas_be.repositorys.RolePermissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final PermissionMapper permissionMapper;

    public PermissionResponse createPermission(PermissionRequest permissionRequest) {
        if (permissionRepository.existsByName(permissionRequest.getName())) {
            throw new AppException("Permission with code " + permissionRequest.getName() + " already exists",
                    ErrorCode.MODEL_ALREADY_EXISTS);
        }

        Permission permission = Permission.builder()
                .name(permissionRequest.getName())
                .description(permissionRequest.getDescription())
                .module(permissionRequest.getModule())
                .build();
        return permissionMapper.mapToResponse(permissionRepository.save(permission));
    }

    public PermissionResponse getPermissionById(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        return permissionMapper.mapToResponse(permission);
    }

    public PermissionResponse updatePermission(Long id, PermissionRequest permissionRequest) {
        Permission existingPermission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));

        existingPermission.setName(permissionRequest.getName());
        existingPermission.setDescription(permissionRequest.getDescription());
        existingPermission.setModule(permissionRequest.getModule());
        Permission updatedPermission = permissionRepository.save(existingPermission);
        return permissionMapper.mapToResponse(updatedPermission);
    }

    public Permission getById(Long id) {
        return permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
    }

    public void deletePermission(Long id) {
        Permission existingPermission = permissionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.PERMISSION_NOT_FOUND));
        permissionRepository.delete(existingPermission);
    }

    public Page<PermissionResponse> getPermissions(Pageable pageable) {
        Page<Permission> permissions = permissionRepository.findAll(pageable);
        return permissions.map(permissionMapper::mapToResponse);
    }

    public List<PermissionResponse> getAllPermissions() {
        List<Permission> permissions = permissionRepository.findAll();
        return permissions.stream().map(permissionMapper::mapToResponse).toList();
    }

    public List<Permission> getPermissionsByRoleId(Long roleId) {
        List<RolePermission> rolePermissions = rolePermissionRepository.getRolePermissionsByRole_Id(roleId);
        return rolePermissions.stream()
                .map(RolePermission::getPermission)
                .toList();
    }
}
