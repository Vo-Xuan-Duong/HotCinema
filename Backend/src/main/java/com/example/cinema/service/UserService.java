package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.user.UserCreateRequest;
import com.example.cinema.dto.user.UserUpdateRequest;
import com.example.cinema.dto.user.UserResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface UserService {
    List<UserResponse> findAll();
    PageResponse<UserResponse> findPage(Pageable pageable);
    UserResponse findById(UUID id);
    UserResponse create(UserCreateRequest request);
    UserResponse update(UUID id, UserUpdateRequest request);
    void deleteById(UUID id);
}
