package com.example.hotcinemas_be.dtos.movie.requests;

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
public class MovieRequest {
    private String title;
    private String originalTitle;
    private String description;
    private Integer durationMinutes;
    private LocalDate releaseDate;
    private String language;
    private String subtitle;
    private String rating;
    private String posterUrl;
    private String backdropUrl;
    private String trailerUrl;
    private String director;
    private List<String> actors;
    private List<Long> genres;
    private MovieStatus status;
}
