package com.example.cinema.dto.moviemedia;

import jakarta.validation.constraints.*;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieMediaUpdateRequest {

    private java.util.UUID movieId;
    @NotBlank
    private String type;
    @NotBlank
    private String url;
    @NotNull
    private Integer sortOrder;
}
