package com.example.cinema.dto.review;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewUpdateRequest {

    @NotNull
    private UUID movieId;

    @NotBlank
    @Size(max = 500)
    private String comment;

    @NotNull
    @Min(1)
    @Max(5)
    private Integer rating;

    private UUID parentId;
}
