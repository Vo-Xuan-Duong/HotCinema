package com.example.cinema.service;

import com.example.cinema.entity.User;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Page<User> findAll(Pageable pageable);
    Optional<User> findById(UUID id);
    User save(User entity);
    void deleteById(UUID id);
}
