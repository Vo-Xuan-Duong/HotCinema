package com.example.hotcinemas_be.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Objects;
import java.util.Set;

/**
 * Tự động xóa toàn bộ Redis cache khi ứng dụng khởi động
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class RedisCacheStartupListener implements ApplicationRunner {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;

    @Override
    public void run(ApplicationArguments args) {
        try {
            log.info("Clearing all Redis cache on application startup...");

            // Xóa tất cả cache names
            cacheManager.getCacheNames().forEach(cacheName -> {
                Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
                log.debug("Cleared cache: {}", cacheName);
            });

            // Xóa tất cả keys trong Redis (nếu có keys không thuộc cache names)
            Set<String> keys = redisTemplate.keys("*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.debug("Deleted {} keys from Redis", keys.size());
            }

            log.info("All Redis cache has been successfully cleared on startup");
        } catch (Exception e) {
            log.error("Failed to clear Redis cache on startup: {}", e.getMessage(), e);
            // Không throw exception để không chặn việc khởi động ứng dụng
        }
    }
}
