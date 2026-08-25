package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.review.ReviewCreateRequest;
import com.example.cinema.dto.review.ReviewRatingSummary;
import com.example.cinema.dto.review.ReviewResponse;
import com.example.cinema.dto.review.ReviewUpdateRequest;
import com.example.cinema.entity.enums.ReviewStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ReviewService {
    PageResponse<ReviewResponse> findAll(Pageable pageable);
    PageResponse<ReviewResponse> findByMovie(UUID movieId, Pageable pageable);
    ReviewResponse findById(UUID id);
    ReviewResponse create(UUID userId, ReviewCreateRequest request);
    ReviewResponse update(UUID id, UUID userId, ReviewUpdateRequest request);
    void delete(UUID id, UUID userId, boolean moderator);
    ReviewResponse moderate(UUID id, ReviewStatus status);
    ReviewRatingSummary getRatingSummary(UUID movieId);
}
