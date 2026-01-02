package com.example.hotcinemas_be.dtos.movie.responses;

import com.example.hotcinemas_be.dtos.genre.responses.GenreResponse;
import com.example.hotcinemas_be.enums.MovieStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class MovieResponse {
    private Long id;
    private String title;
    private String originalTitle;
    private String description;
    private Integer durationMinutes;
    private String durationFormatted;
    private LocalDate releaseDate;
    private String language;
    private String subtitle;
    private String rating;
    private String posterUrl;
    private String backdropUrl;
    private String trailerUrl;
    private String director;
    private List<String> actors;
    private List<GenreResponse> genres;
    private MovieStatus status;
    private Double averageRating;
    private Integer totalRatings;
    private BigDecimal popularity;
    private LocalDateTime createdAt;
}
