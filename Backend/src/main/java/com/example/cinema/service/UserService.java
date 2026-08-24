package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.user.UserCreateRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.dto.user.UserUpdateRequest;
import com.example.cinema.entity.enums.UserStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface UserService {
    List<UserResponse> findAll();
    PageResponse<UserResponse> findPage(Pageable pageable);
    UserResponse findById(UUID id);
    UserResponse create(UserCreateRequest request);
    UserResponse update(UUID id, UserUpdateRequest request);
    UserResponse updateStatus(UUID id, UserStatus status);
    void deleteById(UUID id);
}
