package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.review.request.ReviewRequest;
import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @PostMapping
    public ResponseEntity<?> addReview(@RequestBody ReviewRequest reviewRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Review added successfully")
                .data(reviewService.createReview(reviewRequest))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping
    public ResponseEntity<?> getAllReviews(@PageableDefault(size = 10, page = 0) Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Reviews retrieved successfully")
                .data(reviewService.getAllReviews(pageable))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<?> updateReview(@PathVariable Long reviewId, @RequestBody ReviewRequest reviewRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Review updated successfully")
                .data(reviewService.updateReview(reviewId, reviewRequest))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<?> deleteReview(@PathVariable Long reviewId) {
        reviewService.deleteReview(reviewId);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Review deleted successfully")
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/{reviewId}")
    public ResponseEntity<?> getReview(@PathVariable Long reviewId) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Review retrieved successfully")
                .data(reviewService.getReviewById(reviewId))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getReviewsByMovie(@PathVariable Long movieId, @PageableDefault(size = 5, page = 0) Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Reviews retrieved successfully")
                .data(reviewService.getReviewsByMovieId(movieId, pageable))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/average-rating/{movieId}")
    public ResponseEntity<?> getAverageRating(@PathVariable Long movieId) {
        Double averageRating = reviewService.getAverageRatingByMovieId(movieId);
        Integer countRating = reviewService.getTotalReviewByMovieId(movieId);
        Map<String, Object> ratingMap = new HashMap<>();
        ratingMap.put("averageRating", averageRating);
        ratingMap.put("countRating", countRating);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Average rating retrieved successfully")
                .data(ratingMap)
                .build();
        return ResponseEntity.ok(dataResponse);
    }
}
