package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.movie.responses.MovieResponse;
import com.example.hotcinemas_be.dtos.movie.responses.MovieListItemResponse;
import com.example.hotcinemas_be.models.Movie;
import com.example.hotcinemas_be.services.GenreService;
import com.example.hotcinemas_be.services.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Component
@RequiredArgsConstructor
public class MovieMapper {
    private final GenreService genreService;
    private final ReviewService reviewService;


    public MovieResponse mapToResponse(Movie movie) {
        if (movie == null) {
            return null;
        }

        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .originalTitle(movie.getOriginalTitle())
                .description(movie.getDescription())
                .durationMinutes(movie.getDurationMinutes())
                .durationFormatted(movie.durationFormatted(movie.getDurationMinutes()))
                .releaseDate(movie.getReleaseDate())
                .language(movie.getLanguage())
                .subtitle(movie.getSubtitle())
                .rating(movie.getRating())
                .trailerUrl(movie.getTrailerUrl())
                .posterUrl(movie.getPosterUrl())
                .backdropUrl(movie.getBackdropUrl())
                .director(movie.getDirector())
                .actors(movie.getActors())
                .genres(genreService.getGenresByMovieId(movie.getId()))
                .status(movie.getStatus())
                .averageRating(reviewService.getAverageRatingByMovieId(movie.getId()))
                .totalRatings(reviewService.getTotalReviewByMovieId(movie.getId()))
                .popularity(BigDecimal.ZERO)
                .createdAt(movie.getCreatedAt())
                .build();
    }

    public MovieListItemResponse mapToListItem(Movie movie) {
        return MovieListItemResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .originalTitle(movie.getOriginalTitle())
                .durationMinutes(movie.getDurationMinutes())
                .durationFormatted(movie.durationFormatted(movie.getDurationMinutes()))
                .releaseDate(movie.getReleaseDate())
                .rating(movie.getRating())
                .trailerUrl(movie.getTrailerUrl())
                .posterUrl(movie.getPosterUrl())
                .backdropUrl(movie.getBackdropUrl())
                .genres(genreService.getGenresByMovieId(movie.getId()))
                .status(movie.getStatus())
                .averageRating(reviewService.getAverageRatingByMovieId(movie.getId()))
                .createdAt(movie.getCreatedAt())
                .build();
    }
}
