package com.example.cinema.security;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;

@Service
public class TokenBlacklistService {

    private static final String KEY_PREFIX = "jwt:blacklist:";
    private static final String USER_INVALID_BEFORE_PREFIX = "jwt:user-invalid-before:";

    private final StringRedisTemplate redisTemplate;
    private final Duration sessionTtl;

    public TokenBlacklistService(
            StringRedisTemplate redisTemplate,
            @Value("${app.security.jwt.refresh-token-seconds:604800}") long sessionTtlSeconds
    ) {
        this.redisTemplate = redisTemplate;
        this.sessionTtl = Duration.ofSeconds(sessionTtlSeconds);
    }

    public void revoke(String tokenId, Instant expiresAt) {
        if (tokenId == null || tokenId.isBlank() || expiresAt == null) {
            return;
        }

        Duration ttl = Duration.between(Instant.now(), expiresAt);
        if (ttl.isPositive()) {
            redisTemplate.opsForValue().set(KEY_PREFIX + tokenId, "revoked", ttl);
        }
    }

    public boolean isRevoked(String tokenId) {
        return tokenId != null && Boolean.TRUE.equals(redisTemplate.hasKey(KEY_PREFIX + tokenId));
    }

    public void revokeAllForUser(UUID userId) {
        redisTemplate.opsForValue().set(
                USER_INVALID_BEFORE_PREFIX + userId,
                Long.toString(Instant.now().getEpochSecond()),
                sessionTtl
        );
    }

    public boolean isRevoked(String tokenId, String subject, Instant issuedAt) {
        if (isRevoked(tokenId)) {
            return true;
        }
        if (subject == null || issuedAt == null) {
            return false;
        }

        String invalidBeforeValue = redisTemplate.opsForValue().get(USER_INVALID_BEFORE_PREFIX + subject);
        if (invalidBeforeValue == null) {
            return false;
        }
        return issuedAt.getEpochSecond() <= Long.parseLong(invalidBeforeValue);
    }
}
