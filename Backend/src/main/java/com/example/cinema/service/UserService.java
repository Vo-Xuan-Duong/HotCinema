package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.User;
import com.example.cinema.dto.user.UserResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    List<UserResponse> findAll();
    PageResponse<UserResponse> findPage(Pageable pageable);
    Optional<User> findById(UUID id);
    User save(User entity);
    void deleteById(UUID id);
}
