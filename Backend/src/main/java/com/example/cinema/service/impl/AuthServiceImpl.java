package com.example.cinema.service.impl;

import com.example.cinema.dto.auth.AuthResponse;
import com.example.cinema.dto.auth.LoginRequest;
import com.example.cinema.dto.auth.RegisterRequest;
import com.example.cinema.dto.auth.ResendOtpRequest;
import com.example.cinema.dto.auth.VerifyOtpRequest;
import com.example.cinema.dto.auth.ForgotPasswordRequest;
import com.example.cinema.dto.auth.ResetPasswordRequest;
import com.example.cinema.dto.auth.ChangePasswordRequest;
import com.example.cinema.dto.auth.RefreshTokenRequest;
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
import com.example.cinema.security.EmailOtpService;
import com.example.cinema.security.TokenBlacklistService;
import com.example.cinema.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.Instant;
import java.util.HashSet;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;

@Service
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final EmailOtpService emailOtpService;
    private final JwtDecoder jwtDecoder;

    public AuthServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           RoleRepository roleRepository,
                           UserMapper userMapper,
                           AuthenticationManager authenticationManager,
                           JwtTokenService jwtTokenService,
                           TokenBlacklistService tokenBlacklistService,
                           EmailOtpService emailOtpService,
                           JwtDecoder jwtDecoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userMapper = userMapper;
        this.authenticationManager = authenticationManager;
        this.jwtTokenService = jwtTokenService;
        this.tokenBlacklistService = tokenBlacklistService;
        this.emailOtpService = emailOtpService;
        this.jwtDecoder = jwtDecoder;
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

        User user = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email)
                .orElseThrow(() -> new AppException(
                        ErrorCode.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.FORBIDDEN, "User account is not active");
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Email verification is required");
        }

        user.setLastLoginAt(ZonedDateTime.now());
        userRepository.save(user);

        String accessToken = jwtTokenService.generateAccessToken(user);
        String refreshToken = jwtTokenService.generateRefreshToken(user);

        return new AuthResponse(user.getId(), accessToken, refreshToken);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse refresh(RefreshTokenRequest request) {
        final Jwt jwt;
        try {
            jwt = jwtDecoder.decode(request.refreshToken());
        } catch (JwtException ex) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid or expired refresh token");
        }

        if (!"refresh".equals(jwt.getClaimAsString("token_type"))) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid refresh token");
        }

        UUID userId;
        try {
            userId = UUID.fromString(jwt.getSubject());
        } catch (RuntimeException ex) {
            throw new AppException(ErrorCode.UNAUTHORIZED, "Invalid refresh token subject");
        }

        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new AppException(ErrorCode.UNAUTHORIZED, "User account is unavailable"));
        if (user.getStatus() != UserStatus.ACTIVE || !Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new AppException(ErrorCode.FORBIDDEN, "User account is not allowed to refresh tokens");
        }

        tokenBlacklistService.revoke(jwt.getId(), jwt.getExpiresAt());
        return new AuthResponse(
                user.getId(),
                jwtTokenService.generateAccessToken(user),
                jwtTokenService.generateRefreshToken(user)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse currentUser(UUID userId) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));
        return userMapper.toResponse(user);
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

        User savedUser = userRepository.save(user);
        emailOtpService.issue(savedUser.getEmail());
        return userMapper.toResponse(savedUser);
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public UserResponse verifyOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return userMapper.toResponse(user);
        }

        emailOtpService.verify(email, request.otp());
        user.setEmailVerified(true);
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional(readOnly = true)
    public void resendOtp(ResendOtpRequest request) {
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Email is already verified");
        }

        emailOtpService.issue(email);
    }

    @Override
    @Transactional(readOnly = true)
    public void forgotPassword(ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());
        userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email)
                .ifPresent(user -> emailOtpService.issuePasswordReset(email));
    }

    @Override
    @Transactional(readOnly = true)
    public void verifyPasswordOtp(VerifyOtpRequest request) {
        String email = normalizeEmail(request.email());
        if (!userRepository.existsByEmailIgnoreCase(email)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "OTP is invalid or has expired");
        }
        emailOtpService.validatePasswordReset(email, request.otp());
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void resetPassword(ResetPasswordRequest request) {
        validatePasswordConfirmation(request.newPassword(), request.confirmPassword());
        String email = normalizeEmail(request.email());
        User user = userRepository.findByEmailIgnoreCaseAndIsActiveTrue(email)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "OTP is invalid or has expired"));

        emailOtpService.verifyPasswordReset(email, request.otp());
        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        tokenBlacklistService.revokeAllForUser(user.getId());
    }

    @Override
    @Transactional
    @CacheEvict(value = "users", allEntries = true)
    public void changePassword(
            UUID userId,
            ChangePasswordRequest request
    ) {
        validatePasswordConfirmation(request.newPassword(), request.confirmPassword());
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPasswordHash())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "New password must be different from current password");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        tokenBlacklistService.revokeAllForUser(user.getId());
    }

    @Override
    public void logout(String tokenId, Instant expiresAt) {
        tokenBlacklistService.revoke(tokenId, expiresAt);
    }

    private String normalizeEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Email is required");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private void validatePasswordConfirmation(String password, String confirmation) {
        if (!Objects.equals(password, confirmation)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Password confirmation does not match");
        }
    }
}
