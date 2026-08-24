package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.review.ReviewCreateRequest;
import com.example.cinema.dto.review.ReviewRatingSummary;
import com.example.cinema.dto.review.ReviewResponse;
import com.example.cinema.dto.review.ReviewUpdateRequest;
import com.example.cinema.entity.enums.ReviewStatus;
import com.example.cinema.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reviews")
public class ReviewController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt", "rating", "status");

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.findAll(toPageable(page, size, sort))));
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<ApiResponse<PageResponse<ReviewResponse>>> getByMovie(
            @PathVariable UUID movieId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.findByMovie(movieId, toPageable(page, size, sort))));
    }

    @GetMapping("/average-rating/{movieId}")
    public ResponseEntity<ApiResponse<ReviewRatingSummary>> getAverageRating(@PathVariable UUID movieId) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.getRatingSummary(movieId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewResponse>> create(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReviewCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.create(currentUserId(jwt), request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> update(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ReviewUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.update(id, currentUserId(jwt), request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        reviewService.delete(id, currentUserId(jwt), isAdmin(authentication));
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> approve(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.moderate(id, ReviewStatus.APPROVED)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ReviewResponse>> reject(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(reviewService.moderate(id, ReviewStatus.REJECTED)));
    }

    private UUID currentUserId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    private Pageable toPageable(int page, int size, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String[] parts = sort == null ? new String[0] : sort.split(",", 2);
        String property = parts.length > 0 && ALLOWED_SORT_FIELDS.contains(parts[0])
                ? parts[0]
                : "createdAt";
        Sort.Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, property));
    }
}
