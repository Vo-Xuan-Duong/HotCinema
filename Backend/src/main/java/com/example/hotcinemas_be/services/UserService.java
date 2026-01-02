package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.auth.requests.RegisterRequest;
import com.example.hotcinemas_be.dtos.auth.requests.UpdatePasswordRequest;
import com.example.hotcinemas_be.dtos.user.requests.UserRequest;
import com.example.hotcinemas_be.dtos.user.requests.UserUpdateRequest;
import com.example.hotcinemas_be.dtos.user.responses.UserResponse;
import com.example.hotcinemas_be.enums.ProviderType;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.UserMapper;
import com.example.hotcinemas_be.models.Role;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.RoleRepository;
import com.example.hotcinemas_be.repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserResponse createUser(UserRequest userRequest) {
        User user = new User();
        user.setPassword(passwordEncoder.encode(userRequest.getPassword()));
        user.setEmail(userRequest.getEmail());
        user.setPhone(userRequest.getPhone());
        user.setAvatarUrl(userRequest.getAvatarUrl());
        user.setFullName(userRequest.getFullName());
        user.setAddress(userRequest.getAddress());
        user.setDateOfBirth(userRequest.getDateOfBirth());
        user.setProviderType(ProviderType.LOCAL);
        user.setIsActive(true);

        Role defaultRole = roleRepository.findByName(userRequest.getRole())
                .orElseThrow(() -> new AppException("Role not found when add role to create user",
                        ErrorCode.ROLE_NOT_FOUND));

        user.setRole(defaultRole);

        User savedUser = userRepository.save(user);

        return userMapper.mapToResponse(savedUser);
    }

    public UserResponse updateUser(Long userId, UserUpdateRequest userRequest) {
        User user = userRepository.findById(userId)
                .orElseThrow(
                        () -> new AppException("User not found when update user", ErrorCode.USER_NOT_FOUND));

        user.setPhone(userRequest.getPhone());
        user.setAvatarUrl(userRequest.getAvatarUrl());
        user.setFullName(userRequest.getFullName());
        user.setAddress(userRequest.getAddress());
        user.setDateOfBirth(userRequest.getDateOfBirth());

        Role role = roleRepository.findByName(userRequest.getRole())
                .orElseThrow(() -> new AppException("Role not found when update user",
                        ErrorCode.ROLE_NOT_FOUND));
        user.setRole(role);

        User updatedUser = userRepository.save(user);

        return userMapper.mapToResponse(updatedUser);
    }

    public UserResponse getUserById(Long id) {
        return userRepository.findById(id)
                .map(userMapper::mapToResponse)
                .orElseThrow(
                        () -> new AppException("User not found with id: " + id, ErrorCode.USER_NOT_FOUND));
    }

    public Page<UserResponse> getAllUsers(Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable);
        return userPage.map(userMapper::mapToResponse);
    }

    public List<UserResponse> getAllUsersNoPage() {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            throw new AppException("No users not found", ErrorCode.USER_NOT_FOUND);
        }
        return users.stream().map(userMapper::mapToResponse).toList();
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(
                        () -> new AppException("User not found when delete user", ErrorCode.USER_NOT_FOUND));
        userRepository.delete(user);
    }

    public UserResponse getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(userMapper::mapToResponse)
                .orElseThrow(() -> new AppException("User not found with email: " + email,
                        ErrorCode.USER_NOT_FOUND));
    }

    public UserResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new AppException("Email already exists", ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new AppException("Password and Confirm Password no match",
                    ErrorCode.CONFIRM_PASSWORD_AND_PASSWORD_NOT_MATCH);
        }

        Role defaultRole = roleRepository.findByName("User")
                .orElseThrow(() -> new AppException("Role not found when add role to create user",
                        ErrorCode.ROLE_NOT_FOUND));

        User user = new User();
        user.setPassword(passwordEncoder.encode(registerRequest.getPassword()));
        user.setEmail(registerRequest.getEmail());
        user.setFullName(registerRequest.getFullName());
        user.setRole(defaultRole);
        user.setProviderType(ProviderType.LOCAL);
        user.setIsActive(false);

        User savedUser = userRepository.save(user);

        return userMapper.mapToResponse(savedUser);
    }

    public UserResponse updateUserAvatar(Long id, String avatarUrl) {
        User user = userRepository.findById(id)
                .orElseThrow(
                        () -> new AppException("User not found when update avatar", ErrorCode.MODEL_NOT_FOUND));
        user.setAvatarUrl(avatarUrl);
        return userMapper.mapToResponse(userRepository.save(user));
    }

    public UserResponse updateUserPassword(Long id, UpdatePasswordRequest updatePasswordRequest) {
        if (!updatePasswordRequest.getNewPassword().equals(updatePasswordRequest.getConfirmNewPassword())) {
            throw new AppException("New Password and Confirm Password do not match",
                    ErrorCode.CONFIRM_PASSWORD_AND_PASSWORD_NOT_MATCH);
        }
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found when update password",
                        ErrorCode.MODEL_NOT_FOUND));
        if (!passwordEncoder.matches(updatePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new AppException("Old password does not match", ErrorCode.PASSWORD_NOT_MATCH);
        }
        user.setPassword(passwordEncoder.encode(updatePasswordRequest.getNewPassword()));
        return userMapper.mapToResponse(userRepository.save(user));
    }

    public UserResponse getUserInfo() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new AppException("User not found when get user info", ErrorCode.MODEL_NOT_FOUND));

        return userMapper.mapToResponse(user);
    }

    public void changePassword(String newPassword) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found when change password",
                        ErrorCode.MODEL_NOT_FOUND));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    public UserResponse updateInfoUser(UserUpdateRequest userUpdateRequest) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(
                        () -> new AppException("User not found when update info", ErrorCode.MODEL_NOT_FOUND));

        user.setPhone(userUpdateRequest.getPhone());
        user.setFullName(userUpdateRequest.getFullName());
        user.setAddress(userUpdateRequest.getAddress());
        user.setAvatarUrl(userUpdateRequest.getAvatarUrl());
        user.setDateOfBirth(userUpdateRequest.getDateOfBirth());

        return userMapper.mapToResponse(userRepository.save(user));
    }

    public void changeRoleForUser(Long userId, String roleName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found when change user role",
                        ErrorCode.MODEL_NOT_FOUND));

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new AppException("Role not found when change user role",
                        ErrorCode.ROLE_NOT_FOUND));

        user.setRole(role);
        userRepository.save(user);
    }

    public boolean activateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(
                        () -> new AppException("User not found when activate user", ErrorCode.MODEL_NOT_FOUND));
        if (user.getIsActive()) {
            throw new AppException("User is already active", ErrorCode.USER_ALREADY_ACTIVE);
        }
        user.setIsActive(true);
        userRepository.save(user);
        return true;
    }

    public boolean deactivateUser(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException("User not found when deactivate user",
                        ErrorCode.MODEL_NOT_FOUND));
        if (!user.getIsActive()) {
            throw new AppException("User is already inactive", ErrorCode.USER_ALREADY_INACTIVE);
        }
        user.setIsActive(false);
        userRepository.save(user);
        return true;
    }

    public Page<UserResponse> searchUsers(String keyword, Pageable pageable) {
        Page<User> userPage = userRepository.findAll(pageable).map(user -> {
            if (user.getFullName().toLowerCase().contains(keyword.toLowerCase()) ||
                    user.getEmail().toLowerCase().contains(keyword.toLowerCase())) {
                return user;
            }
            return null;
        });
        return userPage.map(userMapper::mapToResponse);
    }

    public Page<UserResponse> getUsersByRole(String roleName, Pageable pageable) {
        Page<User> userPage = userRepository.findUsersByRole_Name(roleName, pageable);
        return userPage.map(userMapper::mapToResponse);
    }

    public UserResponse processUserOAuth2(String email, String name, String pictureUrl) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            Role defaultRole = roleRepository.findByName("User")
                    .orElseThrow(() -> new AppException("Role not found when add role to create user",
                            ErrorCode.ROLE_NOT_FOUND));

            user = new User();
            user.setEmail(email);
            user.setFullName(name);
            user.setAvatarUrl(pictureUrl);
            user.setProviderType(ProviderType.GOOGLE);
            user.setIsActive(true);
            user.setRole(defaultRole);

            user = userRepository.save(user);
        }else{
            user.setFullName(name);
            user.setAvatarUrl(pictureUrl);
            user = userRepository.save(user);
        }
        return userMapper.mapToResponse(user);
    }

    public void increaseLoyaltyPoints(Long userId, Integer points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found when increase loyalty points",
                        ErrorCode.MODEL_NOT_FOUND));
        user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
        userRepository.save(user);
    }

    public void decreaseLoyaltyPoints(Long userId, Integer points) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found when decrease loyalty points",
                        ErrorCode.MODEL_NOT_FOUND));
        user.setLoyaltyPoints(Math.max(0, user.getLoyaltyPoints() - points));
        userRepository.save(user);
    }

    public void setLastLogin(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found when set last login",
                        ErrorCode.MODEL_NOT_FOUND));
        user.setLastLogin(java.time.LocalDateTime.now());
        userRepository.save(user);
    }

    public Page<UserResponse> getAllUsersWithoutPagination(Pageable pageable) {
        Page<User> userPage = userRepository.findUsersByRole_NameNot("User" , pageable);
        return userPage.map(userMapper::mapToResponse);
    }

    public Page<UserResponse> getAllCustomersWithoutPagination(Pageable pageable) {
        Page<User> userPage = userRepository.findUsersByRole_Name("User" , pageable);
        return userPage.map(userMapper::mapToResponse);
    }
}
