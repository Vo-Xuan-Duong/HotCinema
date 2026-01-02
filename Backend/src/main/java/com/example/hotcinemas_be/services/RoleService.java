package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.role.requests.RoleRequest;
import com.example.hotcinemas_be.dtos.role.responses.RoleResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.RoleMapper;
import com.example.hotcinemas_be.models.Permission;
import com.example.hotcinemas_be.models.Role;
import com.example.hotcinemas_be.models.RolePermission;
import com.example.hotcinemas_be.repositorys.PermissionRepository;
import com.example.hotcinemas_be.repositorys.RolePermissionRepository;
import com.example.hotcinemas_be.repositorys.RoleRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {
    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;
    private final PermissionRepository permissionRepository;
    private final RolePermissionRepository rolePermissionRepository;

    public RoleService(RoleRepository roleRepository,
                       RoleMapper roleMapper,
                       PermissionRepository permissionRepository, RolePermissionRepository rolePermissionRepository) {
        this.roleRepository = roleRepository;
        this.roleMapper = roleMapper;
        this.permissionRepository = permissionRepository;
        this.rolePermissionRepository = rolePermissionRepository;
    }

    public RoleResponse createRole(RoleRequest roleRequest) {
        Role role = new Role();
        if (roleRepository.existsByName(roleRequest.getName())) {
            throw new AppException("Role with code " + roleRequest.getName() + " already exists",
                    ErrorCode.MODEL_ALREADY_EXISTS);
        }
        role.setName(roleRequest.getName());
        role.setDescription(roleRequest.getDescription());
        role.setIsActive(true);
        return roleMapper.mapToResponse(roleRepository.save(role));
    }

    public RoleResponse updateRole(Long roleId, RoleRequest roleRequest) {
        Role existingRole = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));

        if (!existingRole.getName().equals(roleRequest.getName())
                && roleRepository.existsByName(roleRequest.getName())) {
            throw new AppException("Role with code " + roleRequest.getName() + " already exists",
                    ErrorCode.ROLE_ALREADY_EXISTS);
        }
        existingRole.setName(roleRequest.getName());
        existingRole.setDescription(roleRequest.getDescription());
        return roleMapper.mapToResponse(roleRepository.save(existingRole));
    }

    public RoleResponse getRoleById(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));
        return roleMapper.mapToResponse(role);
    }

    public void deleteRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));
        roleRepository.delete(role);
    }

    public RoleResponse getRoleByCode(String name) {
        Role role = roleRepository.findByName(name)
                .orElseThrow(() -> new AppException("Role not found with name: " + name,
                        ErrorCode.ROLE_NOT_FOUND));
        return roleMapper.mapToResponse(role);
    }

    public Page<RoleResponse> getPageRoles(Pageable pageable) {
        Page<Role> roles = roleRepository.findAll(pageable);
        return roles.map(roleMapper::mapToResponse);
    }

    public List<RoleResponse> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return roles.stream().map(roleMapper::mapToResponse).toList();
    }

    public void activateRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));
        role.setIsActive(true);
        roleRepository.save(role);
    }

    public void deactivateRole(Long roleId) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));
        role.setIsActive(false);
        roleRepository.save(role);
    }

    public void addPermissionsToRole(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));

        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

        for (Permission permission : permissions) {
            boolean alreadyExists = role.getRolePermissions().stream()
                    .anyMatch(rp -> rp.getPermission().getId().equals(permission.getId()));
            if (!alreadyExists) {
                RolePermission rp = RolePermission.builder()
                        .role(role)
                        .permission(permission)
                        .build();
                rolePermissionRepository.save(rp);
            }
        }
    }

    public void removePermissionsFromRole(Long roleId, List<Long> permissionIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new AppException("Role not found with id: " + roleId,
                        ErrorCode.ROLE_NOT_FOUND));

        List<Permission> permissions = permissionRepository.findAllById(permissionIds);

        role.getRolePermissions().removeIf(rp ->
                rp.getPermission() != null &&
                        permissions.stream().anyMatch(p -> p.getId().equals(rp.getPermission().getId())));

    }
}
