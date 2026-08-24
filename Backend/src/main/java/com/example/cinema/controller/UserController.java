package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.user.UserCreateRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.dto.user.UserUpdateRequest;
import com.example.cinema.entity.enums.UserStatus;
import com.example.cinema.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(userService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<UserResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(userService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(userService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserResponse>> create(@Valid @RequestBody UserCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(userService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(userService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UserStatusUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(userService.updateStatus(id, request.status())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        userService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record UserStatusUpdateRequest(@NotNull UserStatus status) {}
}
