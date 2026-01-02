package com.example.hotcinemas_be.dtos.comment.response;

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
public class CommentResponse {
    private Long id;
    private String comment;
    private Integer rating;
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private LocalDateTime createdAt;

    private List<CommentResponse> replies;
}
