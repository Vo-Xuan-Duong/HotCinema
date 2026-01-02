package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Objects;
import java.util.Set;

@RestController
@RequestMapping("/api/v1/cache")
@Tag(name = "Cache Management", description = "APIs for managing system cache")
public class CacheController {

    private final CacheManager cacheManager;
    private final RedisTemplate<String, Object> redisTemplate;

    public CacheController(CacheManager cacheManager, RedisTemplate<String, Object> redisTemplate) {
        this.cacheManager = cacheManager;
        this.redisTemplate = redisTemplate;
    }

    @Operation(summary = "Clear all cache", description = "Delete all cache entries from Redis")
    @DeleteMapping("/clear-all")
    public ResponseEntity<DataResponse<String>> clearAllCache() {
        try {
            // Xóa tất cả cache names
            cacheManager.getCacheNames().forEach(cacheName -> {
                Objects.requireNonNull(cacheManager.getCache(cacheName)).clear();
            });

            // Xóa tất cả keys trong Redis (nếu có keys không thuộc cache names)
            Set<String> keys = redisTemplate.keys("*");
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }

            DataResponse<String> dataResponse = DataResponse.<String>builder()
                    .status(200)
                    .message("All cache has been successfully cleared")
                    .data("Cache cleared successfully")
                    .timestamp(LocalDateTime.now())
                    .build();

            return ResponseEntity.ok(dataResponse);
        } catch (Exception e) {
            DataResponse<String> dataResponse = DataResponse.<String>builder()
                    .status(500)
                    .message("Failed to clear cache: " + e.getMessage())
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();

            return ResponseEntity.status(500).body(dataResponse);
        }
    }

    @Operation(summary = "Clear specific cache", description = "Delete cache entries for a specific cache name")
    @DeleteMapping("/clear/{cacheName}")
    public ResponseEntity<DataResponse<String>> clearCacheByName(@PathVariable String cacheName) {
        try {
            var cache = cacheManager.getCache(cacheName);
            if (cache != null) {
                cache.clear();
                DataResponse<String> dataResponse = DataResponse.<String>builder()
                        .status(200)
                        .message("Cache '" + cacheName + "' has been successfully cleared")
                        .data("Cache '" + cacheName + "' cleared successfully")
                        .timestamp(LocalDateTime.now())
                        .build();
                return ResponseEntity.ok(dataResponse);
            } else {
                DataResponse<String> dataResponse = DataResponse.<String>builder()
                        .status(404)
                        .message("Cache '" + cacheName + "' not found")
                        .data(null)
                        .timestamp(LocalDateTime.now())
                        .build();
                return ResponseEntity.status(404).body(dataResponse);
            }
        } catch (Exception e) {
            DataResponse<String> dataResponse = DataResponse.<String>builder()
                    .status(500)
                    .message("Failed to clear cache: " + e.getMessage())
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.status(500).body(dataResponse);
        }
    }

    @Operation(summary = "Get all cache names", description = "Retrieve list of all cache names in the system")
    @GetMapping("/names")
    public ResponseEntity<DataResponse<Collection<String>>> getAllCacheNames() {
        try {
            Collection<String> cacheNames = cacheManager.getCacheNames();
            DataResponse<Collection<String>> dataResponse = DataResponse.<Collection<String>>builder()
                    .status(200)
                    .message("Successfully retrieved all cache names")
                    .data(cacheNames)
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.ok(dataResponse);
        } catch (Exception e) {
            DataResponse<Collection<String>> dataResponse = DataResponse.<Collection<String>>builder()
                    .status(500)
                    .message("Failed to retrieve cache names: " + e.getMessage())
                    .data(null)
                    .timestamp(LocalDateTime.now())
                    .build();
            return ResponseEntity.status(500).body(dataResponse);
        }
    }
}

