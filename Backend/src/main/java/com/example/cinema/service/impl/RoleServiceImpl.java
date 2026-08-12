package com.example.cinema.service.impl;

import com.example.cinema.entity.Role;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Role> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "roles", key = "#id")
    public Optional<Role> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "roles", key = "#result.id")
    public Role save(Role entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "roles", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
