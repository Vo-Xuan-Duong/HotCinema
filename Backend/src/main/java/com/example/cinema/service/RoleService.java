package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Role;
import com.example.cinema.dto.role.RoleResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface RoleService {
    List<RoleResponse> findAll();
    PageResponse<RoleResponse> findPage(Pageable pageable);
    Optional<Role> findById(UUID id);
    Role save(Role entity);
    void deleteById(UUID id);
}
