package com.example.cinema.controller;

import com.example.cinema.entity.Role;
import com.example.cinema.service.RoleService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.RoleMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.role.RoleCreateRequest;
import com.example.cinema.dto.role.RoleUpdateRequest;
import com.example.cinema.dto.role.RoleResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/roles")
public class RoleController {

    private final RoleService roleService;
    private final RoleMapper roleMapper;

    public RoleController(RoleService roleService, RoleMapper roleMapper) {
        this.roleService = roleService;
        this.roleMapper = roleMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<RoleResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(roleService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<RoleResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(roleService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> getById(@PathVariable UUID id) {
        RoleResponse res = roleService.findById(id)
                .map(roleMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<RoleResponse>> create(@Valid @RequestBody RoleCreateRequest request) {
        Role entity = roleMapper.toEntity(request);
        Role saved = roleService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(roleMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoleResponse>> update(@PathVariable UUID id, @Valid @RequestBody RoleUpdateRequest request) {
        Role existing = roleService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id.toString()));
        roleMapper.updateEntityFromRequest(request, existing);
        Role saved = roleService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(roleMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        roleService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id.toString()));
        roleService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
