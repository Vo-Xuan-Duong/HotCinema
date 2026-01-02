package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.review.request.ReviewRequest;
import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.services.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @PostMapping
    public ResponseEntity<?> addComment(@RequestBody ReviewRequest reviewRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Comment added successfully")
                .data(commentService.createComment(reviewRequest))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(@PathVariable Long commentId, @RequestBody ReviewRequest reviewRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Comment updated successfully")
                .data(commentService.updateComment(commentId, reviewRequest))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Comment deleted successfully")
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<?> getComment(@PathVariable Long commentId) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Comment retrieved successfully")
                .data(commentService.getCommentById(commentId))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getCommentsByMovie(@PathVariable Long movieId, @PageableDefault(size = 5, page = 0) Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Comments retrieved successfully")
                .data(commentService.getCommentsByMovieId(movieId, pageable))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/average-rating/{movieId}")
    public ResponseEntity<?> getAverageRating(@PathVariable Long movieId) {
        Double averageRating = commentService.getAverageRatingByMovieId(movieId);
        Long countRating = commentService.getCommentCountByMovieId(movieId);
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
