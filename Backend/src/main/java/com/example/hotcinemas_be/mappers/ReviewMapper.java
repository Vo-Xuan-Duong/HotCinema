package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.review.response.ReviewItemResponse;
import com.example.hotcinemas_be.dtos.review.response.ReviewResponse;
import com.example.hotcinemas_be.models.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .comment(review.getComment())
                .rating(review.getRating())
                .userId(review.getUser().getId())
                .fullName(review.getUser().getFullName())
                .avatarUrl(review.getUser().getAvatarUrl())
                .createdAt(review.getCreatedAt())
                .replies(review.getReplies() != null ? review.getReplies().stream().map(this::mapToResponse).toList() : null)
                .build();
    }

    public ReviewItemResponse mapToItemResponse(Review review) {
        return ReviewItemResponse.builder()
                .id(review.getId())
                .movieId(review.getMovie().getId())
                .movieTitle(review.getMovie().getTitle())
                .comment(review.getComment())
                .rating(review.getRating())
                .userId(review.getUser().getId())
                .fullName(review.getUser().getFullName())
                .avatarUrl(review.getUser().getAvatarUrl())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
