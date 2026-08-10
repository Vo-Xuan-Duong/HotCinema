package com.example.cinema.service;

import com.example.cinema.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    List<User> findAll();
    Optional<User> findById(UUID id);
    User save(User entity);
    void deleteById(UUID id);
}
