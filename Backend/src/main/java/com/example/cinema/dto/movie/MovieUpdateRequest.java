package com.example.cinema.dto.movie;

import jakarta.validation.constraints.*;

import com.example.cinema.entity.enums.AgeRating;
import com.example.cinema.entity.enums.MovieStatus;
import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieUpdateRequest {

    @NotBlank

    private String title;
    @NotBlank
    private String originalTitle;
    @NotBlank
    private String slug;
    @NotBlank
    private String description;
    @NotNull
    private Integer durationMinutes;
    @NotNull
    private LocalDate releaseDate;
    @NotNull
    private LocalDate endDate;
    @NotNull
    private AgeRating ageRating;
    @NotBlank
    private String originalLanguage;
    @NotBlank
    private String director;
    @NotBlank
    private String actors;
    @NotBlank
    private String country;
    @NotBlank
    private String productionCompany;
    @NotBlank
    private String posterUrl;
    @NotBlank
    private String bannerUrl;
    @NotBlank
    private String trailerUrl;
    @NotNull
    private MovieStatus status;
}
