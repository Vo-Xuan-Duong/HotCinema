package com.example.hotcinemas_be.dtos.review.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ReviewResponse {
    private Long id;
    private String comment;
    private Integer rating;
    private Long userId;
    private String fullName;
    private String avatarUrl;
    private LocalDateTime createdAt;

    private List<ReviewResponse> replies;
}
