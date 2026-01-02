package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.auth.requests.NewPassword;
import com.example.hotcinemas_be.dtos.auth.requests.LoginRequest;
import com.example.hotcinemas_be.dtos.auth.requests.RegisterRequest;
import com.example.hotcinemas_be.dtos.auth.responses.AuthResponse;
import com.example.hotcinemas_be.dtos.user.responses.UserResponse;
import com.example.hotcinemas_be.enums.TokenType;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.security.JwtService;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.UserRepository;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeTokenRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final RefreshTokenService refreshTokenService;
    private final OTPService otpService;
    private final EmailService emailService;
    private final BlackListService blackListService;

    @Value("${google.client.id}")
    private String googleClientId;
    @Value("${google.client.secret}")
    private String googleClientSecret;

    public AuthResponse loginHandler(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();

//        UserDetails userDetails = userDetailsService.loadUserByUsername(loginRequest.getEmail());
        userService.setLastLogin(loginRequest.getEmail());

        String accessToken = jwtService.generateToken(TokenType.ACCESS, userDetails);
        String refreshToken = jwtService.generateToken(TokenType.REFRESH, userDetails);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .userAuth(userService.getUserByEmail(loginRequest.getEmail()))
                .build();
    }

    public AuthResponse refreshTokenHandler(String refreshToken) {
        if (refreshToken == null || refreshToken.isEmpty()) {
            throw new AppException("Refresh token is required", ErrorCode.INVALID_TOKEN);
        }

        String email = jwtService.extractEmail(refreshToken, TokenType.REFRESH);
        if (email == null) {
            throw new AppException("Refresh token is required", ErrorCode.INVALID_TOKEN);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        if (userDetails == null) {
            throw new AppException("User not found for the provided refresh token", ErrorCode.MODEL_NOT_FOUND);
        }

        String newAccessToken = jwtService.generateToken(TokenType.ACCESS, userDetails);

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(refreshToken)
                .userAuth(userService.getUserByEmail(email))
                .build();
    }

    public void registerHandler(RegisterRequest registerRequest) {
        UserResponse user = userService.registerUser(registerRequest);
        if (user == null) {
            throw new AppException("Registration failed", ErrorCode.REGISTRATION_FAILED);
        }
        String otp = otpService.generateOTP(user.getEmail());
        log.info("OTP register verify: {}", otp);
        emailService.sendOTPConfirmationEmail(user.getEmail(), otp);
    }

    public Boolean verifyOTP(String email, String otpCode) {
        if (!otpService.validateOTP(email, otpCode)) {
            throw new AppException("Invalid OTP", ErrorCode.INVALID_REQUEST);
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", ErrorCode.MODEL_NOT_FOUND));

        user.setIsActive(true);
        userRepository.save(user);
        return true;
    }

    public void logoutHandler(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            throw new AppException("Access token is required", ErrorCode.INVALID_TOKEN);
        }

        accessToken = accessToken.replace("Bearer ", "");
        String tokenId = jwtService.extractId(accessToken, TokenType.ACCESS);
        if (tokenId == null) {
            throw new AppException("Invalid access token", ErrorCode.INVALID_TOKEN);
        }

        blackListService.saveTokenToBlacklist(accessToken, tokenId);
    }

    public Boolean forgetPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", ErrorCode.MODEL_NOT_FOUND));
        if (!user.getIsActive()) {
            throw new AppException("User is not active", ErrorCode.UNAUTHORIZED);
        }
        String otp = otpService.generateOTP(email);
        log.info("OTP register verify: {}", otp);
        emailService.sendOTPConfirmationEmail(email, otp);
        return true;
    }

    public Boolean verifyOTPChangePasswordToken(String email, String otpCode) {
        if (!otpService.validateOTP(otpCode, email)) {
            throw new AppException("Invalid OTP", ErrorCode.INVALID_REQUEST);
        }
        return true;
    }

    public Boolean changePassword(NewPassword newPassword) {
        userService.changePassword(newPassword.getNewPassword());
        return true;
    }

    public User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        if (email == null || email.isEmpty()) {
            throw new AppException("Người dùng chưa đăng nhập vui lòng đăng nhập ",
                    ErrorCode.AUTHENTICATION_REQUIRED);
        }

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", ErrorCode.MODEL_NOT_FOUND));
    }

    public void resendOTP(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", ErrorCode.MODEL_NOT_FOUND));
        String otp = otpService.generateOTP(user.getEmail());
        log.info("OTP register verify: {}", otp);
        emailService.sendOTPConfirmationEmail(user.getEmail(), otp);
    }

    public AuthResponse googleLoginHandler(String code) {
        try {

            TokenResponse response = new GoogleAuthorizationCodeTokenRequest(
                    new NetHttpTransport(),
                    GsonFactory.getDefaultInstance(),
                    "https://oauth2.googleapis.com/token",
                    googleClientId,
                    googleClientSecret,
                    code,
                    "postmessage")
                    .execute();

            String idTokenString = (String) response.get("id_token");

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                GoogleIdToken.Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                String name = (String) payload.get("name");
                String pictureUrl = (String) payload.get("picture");

                UserResponse user = userService.processUserOAuth2(email, name, pictureUrl);

                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                String accessToken = jwtService.generateToken(TokenType.ACCESS ,userDetails);
                String refreshToken = jwtService.generateToken(TokenType.ACCESS ,userDetails);

                return AuthResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .userAuth(user)
                        .build();
            }
        } catch (Exception e) {
            log.error("Google authentication failed: {}", e.getMessage());
            throw new AppException("Xác thực Google thất bại", ErrorCode.UNAUTHORIZED);
        }

        return null;
    }
}
