package com.example.cinema.dto.review;

import com.example.cinema.entity.enums.ReviewStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewResponse {
    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID movieId;
    private String movieTitle;
    private UUID userId;
    private String fullName;
    private String avatarUrl;
    private Integer rating;
    private String comment;
    private ReviewStatus status;
    private UUID parentId;

    @Builder.Default
    private List<ReviewResponse> replies = new ArrayList<>();
}
