package com.example.cinema.service;

import com.example.cinema.entity.Role;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface RoleService {
    Page<Role> findAll(Pageable pageable);
    Optional<Role> findById(UUID id);
    Role save(Role entity);
    void deleteById(UUID id);
}
