package com.example.cinema.service.impl;

import com.example.cinema.dto.auth.AuthResponse;
import com.example.cinema.dto.auth.LoginRequest;
import com.example.cinema.dto.auth.RegisterRequest;
import com.example.cinema.dto.user.UserResponse;
import com.example.cinema.entity.Role;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.UserStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.mapper.UserMapper;
import com.example.cinema.repository.RoleRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.security.JwtTokenService;
import com.example.cinema.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoleRepository roleRepository,
                           UserMapper userMapper,
                           AuthenticationManager authenticationManager,
                           JwtTokenService jwtTokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest loginRequest) {
        String email = normalizeEmail(loginRequest.email());

        try {
            authenticationManager.authenticate(
                    UsernamePasswordAuthenticationToken.unauthenticated(
                            email,
                            loginRequest.password()
                    )
            );
        } catch (AuthenticationException ex) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid email or password");
        }

        User user = userRepository.findByEmailIgnoreCaseAndIsDeletedFalse(email)
                .orElseThrow(() -> new AppException(
                        ErrorCode.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.FORBIDDEN, "User account is not active");
        }

        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenService.generateAccessToken(user);
        String refreshToken = jwtTokenService.generateRefreshToken(user);

        return new AuthResponse(accessToken, refreshToken);
    }

    @Override
    @Transactional
    public UserResponse register(RegisterRequest registerRequest) {
        String email = normalizeEmail(registerRequest.email());

        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.RESOURCE_EXISTS, "User email already exists");
        }

        if (!Objects.equals(registerRequest.password(), registerRequest.confirmPassword())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Password confirmation does not match");
        }

        HashSet<Role> roles = new HashSet<>();
        Role role = roleRepository.findRoleByCode("user").orElseThrow(
                () -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Role user not found")
        );
        roles.add(role);

        User user = User.builder()
                .email(email)
                .fullName(registerRequest.fullName())
                .phone(registerRequest.phone())
                .passwordHash(passwordEncoder.encode(registerRequest.password()))
                .status(UserStatus.ACTIVE)
                .emailVerified(false)
                .phoneVerified(false)
                .roles(roles)
                .build();

        return userMapper.toResponse(userRepository.save(user));
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
