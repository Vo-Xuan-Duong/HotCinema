package com.example.hotcinemas_be.dtos.movie.responses;

import com.example.hotcinemas_be.dtos.genre.responses.GenreResponse;
import com.example.hotcinemas_be.enums.MovieStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MovieListItemResponse {
    private Long id;
    private String title;
    private String originalTitle;
    private Integer durationMinutes;
    private String durationFormatted;
    private LocalDate releaseDate;
    private String rating;
    private String posterUrl;
    private String backdropUrl;
    private String trailerUrl;
    private List<GenreResponse> genres;
    private MovieStatus status;
    private Double averageRating;
    private LocalDateTime createdAt;
}
