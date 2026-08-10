package com.example.cinema.service.impl;

import com.example.cinema.entity.Role;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.service.RoleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleServiceImpl implements RoleService {

    private final RoleRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Role> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Role> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Role save(Role entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
