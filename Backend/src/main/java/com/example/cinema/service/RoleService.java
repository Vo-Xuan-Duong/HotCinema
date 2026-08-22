package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.role.RoleCreateRequest;
import com.example.cinema.dto.role.RoleUpdateRequest;
import com.example.cinema.dto.role.RoleResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface RoleService {
    List<RoleResponse> findAll();
    PageResponse<RoleResponse> findPage(Pageable pageable);
    RoleResponse findById(UUID id);
    RoleResponse create(RoleCreateRequest request);
    RoleResponse update(UUID id, RoleUpdateRequest request);
    void deleteById(UUID id);
}
