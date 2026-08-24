package com.example.cinema.dto.movie;

import java.util.UUID;

import com.example.cinema.entity.enums.AgeRating;
import com.example.cinema.entity.enums.MovieStatus;
import java.time.LocalDate;
import java.util.Set;
import com.example.cinema.dto.genre.GenreResponse;
import java.time.ZonedDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovieResponse {

    private java.util.UUID id;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    private String title;
    private String originalTitle;
    private String slug;
    private String description;
    private Integer durationMinutes;
    private LocalDate releaseDate;
    private LocalDate endDate;
    private AgeRating ageRating;
    private String originalLanguage;
    private String director;
    private String actors;
    private String country;
    private String productionCompany;
    private String posterUrl;
    private String bannerUrl;
    private String trailerUrl;
    private MovieStatus status;
    private ZonedDateTime deletedAt;
    private Set<GenreResponse> genres;
}
