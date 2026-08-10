package com.example.cinema.service;

import com.example.cinema.entity.Role;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoleService {
    List<Role> findAll();
    Optional<Role> findById(UUID id);
    Role save(Role entity);
    void deleteById(UUID id);
}
