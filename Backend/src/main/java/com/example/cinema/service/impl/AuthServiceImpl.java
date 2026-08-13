package com.example.cinema.service.impl;

import com.example.cinema.dto.auth.AuthResponse;
import com.example.cinema.dto.auth.LoginRequest;
import com.example.cinema.dto.auth.RegisterRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.entity.Role;
import com.example.cinema.entity.User;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.mapper.UserMapper;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;

    public AuthServiceImpl(UserRepository userRepository ,
                           PasswordEncoder passwordEncoder ,
                           RoleRepository roleRepository ,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
    }

    @Override
    public AuthResponse login(LoginRequest loginRequest) {

    }

    @Override
    public UserResponse register(RegisterRequest registerRequest) {

        if(userRepository.existsByEmail(registerRequest.email())){
            throw new AppException(ErrorCode.RESOURCE_EXISTS, "User email already exists");
        }

        HashSet<Role> roles = new HashSet<>();
        Role role = roleRepository.findRoleByCode("user").orElseThrow(
                () -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Role user not found")
        );
        roles.add(role);

        User user = User.builder()
                .email(registerRequest.email())
                .fullName(registerRequest.fullName())
                .phone(registerRequest.phone())
                .passwordHash(passwordEncoder.encode(registerRequest.password()))
                .roles(roles)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }
}
