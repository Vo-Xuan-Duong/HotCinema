package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.user.UserCreateRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.dto.user.UserUpdateRequest;
import com.example.cinema.entity.Role;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.UserStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.UserMapper;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository repository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<UserResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(userMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "users", key = "#id")
    public UserResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(userMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse create(UserCreateRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (repository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTS, "User email already exists");
        }

        User entity = userMapper.toEntity(request);
        entity.setEmail(email);
        entity.setFullName(request.getFullName().trim());
        entity.setPhone(trimToNull(request.getPhone()));
        entity.setAvatarUrl(trimToNull(request.getAvatarUrl()));
        entity.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        entity.setStatus(request.getStatus() == null ? UserStatus.ACTIVE : request.getStatus());
        entity.setEmailVerified(Boolean.TRUE.equals(request.getEmailVerified()));
        entity.setPhoneVerified(Boolean.TRUE.equals(request.getPhoneVerified()));
        entity.setRoles(singleRole(request.getRoleCode()));
        return userMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse update(UUID id, UserUpdateRequest request) {
        User entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));

        if (request.getEmail() != null) {
            String email = normalizeEmail(request.getEmail());
            if (!email.equalsIgnoreCase(entity.getEmail()) && repository.existsByEmailIgnoreCase(email)) {
                throw new AppException(ErrorCode.RESOURCE_EXISTS, "User email already exists");
            }
            request.setEmail(email);
        }
        if (request.getFullName() != null) request.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) request.setPhone(trimToNull(request.getPhone()));
        if (request.getAvatarUrl() != null) request.setAvatarUrl(trimToNull(request.getAvatarUrl()));

        userMapper.updateEntityFromRequest(request, entity);
        if (request.getRoleCode() != null && !request.getRoleCode().isBlank()) {
            entity.setRoles(singleRole(request.getRoleCode()));
        }
        return userMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse updateStatus(UUID id, UserStatus status) {
        User entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        entity.setStatus(status);
        return userMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", key = "#id")
    public void deleteById(UUID id) {
        User entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id.toString()));
        entity.setActive(false);
        entity.setDeletedAt(ZonedDateTime.now());
        repository.save(entity);
    }

    private HashSet<Role> singleRole(String requestedCode) {
        String code = requestedCode == null || requestedCode.isBlank()
                ? "user"
                : requestedCode.trim().toLowerCase(Locale.ROOT);
        Role role = roleRepository.findRoleByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Role " + code + " not found"));
        HashSet<Role> roles = new HashSet<>();
        roles.add(role);
        return roles;
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }

    private String trimToNull(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
