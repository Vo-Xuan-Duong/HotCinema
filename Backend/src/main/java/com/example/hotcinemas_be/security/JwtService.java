package com.example.hotcinemas_be.security;

import com.example.hotcinemas_be.enums.TokenType;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.UserRepository;
import com.example.hotcinemas_be.services.RefreshTokenService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Slf4j
@Service
public class JwtService {

    private final UserRepository userRepository;
    @Value("${jwt.secret.access}")
    private String SECRET_ACCESS;
    @Value("${jwt.secret.refresh}")
    private String SECRET_REFRESH;
    @Value("${jwt.issuer}")
    private String ISSUER;
    @Value("${jwt.expiration.access}")
    private long EXPIRATION_ACCESS;
    @Value("${jwt.expiration.refresh}")
    private long EXPIRATION_REFRESH;

    private final RefreshTokenService refreshTokenService;

    public JwtService(RefreshTokenService refreshTokenService, UserRepository userRepository) {
        this.refreshTokenService = refreshTokenService;
        this.userRepository = userRepository;
    }

    public String generateToken(TokenType tokenType, UserDetails userDetails) {

        String token = Jwts.builder()
                .claim("roles : ", getRole(userDetails))
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .issuer(ISSUER)
                .expiration(getExpirationDate(tokenType))
                .signWith(getSecretKey(tokenType))
                .compact();

        if (tokenType.equals(TokenType.REFRESH)) {
            refreshTokenService.addRefreshToken(userDetails.getUsername(), token);
        }

        return token;
    }

    private String getRole(UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow(() -> new AppException("User not found", ErrorCode.USER_NOT_FOUND));
        return user.getRole().getName();
    }

    private Date getExpirationDate(TokenType tokenType) {
        return tokenType.equals(TokenType.ACCESS) ? new Date(System.currentTimeMillis() + EXPIRATION_ACCESS)
                : new Date(System.currentTimeMillis() + EXPIRATION_REFRESH);
    }

    private SecretKey getSecretKey(TokenType tokenType) {
        return tokenType.equals(TokenType.ACCESS)
                ? io.jsonwebtoken.security.Keys.hmacShaKeyFor(SECRET_ACCESS.getBytes())
                : io.jsonwebtoken.security.Keys.hmacShaKeyFor(SECRET_REFRESH.getBytes());
    }

    public Claims extractClaims(String token, TokenType tokenType) {
        return Jwts.parser()
                .verifyWith(getSecretKey(tokenType))
                .requireIssuer(ISSUER)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private boolean isTokenExpired(String token, TokenType tokenType) {
        Claims claims = extractClaims(token, tokenType);
        Date expiration = claims.getExpiration();
        return expiration.before(new Date());
    }

    public boolean validateToken(String token, UserDetails userDetails, TokenType tokenType) {
        String username = extractClaims(token, tokenType).getSubject();
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token, tokenType));
    }

    public String extractEmail(String token, TokenType tokenType) {
        return extractClaims(token, tokenType).getSubject();
    }

    public String extractId(String token, TokenType tokenType) {
        return extractClaims(token, tokenType).getId();
    }

}
