package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Role;
import com.example.cinema.dto.role.RoleCreateRequest;
import com.example.cinema.dto.role.RoleUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.role.RoleResponse;
import com.example.cinema.mapper.RoleMapper;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;
    private final RoleMapper roleMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RoleResponse> findAll() {
        return roleMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RoleResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(roleMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "roles", key = "#id")
    public RoleResponse findById(UUID id) {
        return repository.findById(id)
                .map(roleMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "roles", allEntries = true)
    public RoleResponse create(RoleCreateRequest request) {
        Role entity = roleMapper.toEntity(request);
        return roleMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "roles", allEntries = true)
    public RoleResponse update(UUID id, RoleUpdateRequest request) {
        Role entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id.toString()));
        roleMapper.updateEntityFromRequest(request, entity);
        return roleMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "roles", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
