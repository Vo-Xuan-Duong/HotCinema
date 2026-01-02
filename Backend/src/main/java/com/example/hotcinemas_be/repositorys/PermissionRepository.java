package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Permission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    boolean existsByName(String name);
}
