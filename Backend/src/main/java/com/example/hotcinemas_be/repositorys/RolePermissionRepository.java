package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.*;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    List<RolePermission> findByRole(Role role);

    List<RolePermission> findByPermission(Permission permission);

    List<RolePermission> getRolePermissionsByRole_Id(Long roleId);
}
