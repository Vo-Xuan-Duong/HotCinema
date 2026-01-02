package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.common.PageResponse;
import com.example.hotcinemas_be.dtos.movie.requests.MovieRequest;
import com.example.hotcinemas_be.dtos.movie.requests.MovieSearchRequest;
import com.example.hotcinemas_be.dtos.movie.responses.MovieResponse;
import com.example.hotcinemas_be.dtos.movie.responses.MovieListItemResponse;
import com.example.hotcinemas_be.enums.MovieStatus;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.MovieMapper;
import com.example.hotcinemas_be.mappers.PageMapper;
import com.example.hotcinemas_be.models.Genre;
import com.example.hotcinemas_be.models.Movie;
import com.example.hotcinemas_be.models.MovieGenre;
import com.example.hotcinemas_be.repositorys.GenreRepository;
import com.example.hotcinemas_be.repositorys.MovieGenreRepository;
import com.example.hotcinemas_be.repositorys.MovieRepository;
import com.example.hotcinemas_be.repositorys.ReviewRepository;
import com.example.hotcinemas_be.specifications.MovieSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MovieService {

    private final MovieRepository movieRepository;
    private final MovieGenreRepository movieGenreRepository;
    private final MovieMapper movieMapper;
    private final GenreRepository genreRepository;
    private final MovieSpecification movieSpecification;
    private final PageMapper pageMapper;
    private final ReviewRepository reviewRepository;

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = "movies-page", allEntries = true),
            @CacheEvict(value = "coming-soon-movies-page", allEntries = true),
            @CacheEvict(value = "now-showing-movies-page", allEntries = true),
            @CacheEvict(value = "top-rated-movies-page", allEntries = true)
    })
    public MovieResponse createMovie(MovieRequest movieRequest) {

        if (movieRepository.existsByTitle(movieRequest.getTitle())) {
            throw new AppException("Movie with title '" + movieRequest.getTitle() + "' already exists",
                    ErrorCode.MOVIE_CONFLICT);
        }

        Movie movie = new Movie();
        movie.setTitle(movieRequest.getTitle());
        movie.setOriginalTitle(movieRequest.getOriginalTitle());
        movie.setDescription(movieRequest.getDescription());
        movie.setDurationMinutes(movieRequest.getDurationMinutes());
        movie.setReleaseDate(movieRequest.getReleaseDate());
        movie.setLanguage(movieRequest.getLanguage());
        movie.setSubtitle(movieRequest.getSubtitle());
        movie.setRating(movieRequest.getRating());
        movie.setPosterUrl(movieRequest.getPosterUrl());
        movie.setBackdropUrl(movieRequest.getBackdropUrl());
        movie.setTrailerUrl(movieRequest.getTrailerUrl());
        movie.setDirector(movieRequest.getDirector());
        movie.setActors(movieRequest.getActors());
        movie.setStatus(movieRequest.getStatus());

        Movie savedMovie = movieRepository.save(movie);

        movieRequest.getGenres().forEach(genre -> {
            addGenreToMovie(savedMovie, genre);
        });

        return movieMapper.mapToResponse(savedMovie);
    }

    @Transactional
    @CachePut(value = "movie", key = "#movieId")
    public MovieResponse updateMovie(Long movieId, MovieRequest movieRequest) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException("Movie not found with id: " + movieId,
                        ErrorCode.MODEL_NOT_FOUND));
        movie.setTitle(movieRequest.getTitle());
        movie.setOriginalTitle(movieRequest.getOriginalTitle());
        movie.setDescription(movieRequest.getDescription());
        movie.setDurationMinutes(movieRequest.getDurationMinutes());
        movie.setReleaseDate(movieRequest.getReleaseDate());
        movie.setLanguage(movieRequest.getLanguage());
        movie.setSubtitle(movieRequest.getSubtitle());
        movie.setRating(movieRequest.getRating());
        movie.setPosterUrl(movieRequest.getPosterUrl());
        movie.setBackdropUrl(movieRequest.getBackdropUrl());
        movie.setTrailerUrl(movieRequest.getTrailerUrl());
        movie.setDirector(movieRequest.getDirector());
        movie.setActors(movieRequest.getActors());
        movie.setStatus(movieRequest.getStatus());

        Movie savedMovie = movieRepository.save(movie);

        removeAllGenresFromMovie(savedMovie);

        movieRequest.getGenres().forEach(genre -> {
            addGenreToMovie(savedMovie, genre);
        });

        return movieMapper.mapToResponse(savedMovie);
    }

    @Cacheable(value = "movie", key = "#movieId", unless = "#result == null")
    public Object getMovieById(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException("Movie not found with id: " + movieId,
                        ErrorCode.MODEL_NOT_FOUND));
        return movieMapper.mapToResponse(movie);
    }

    @Caching(evict = {
            @CacheEvict(value = "movie", key = "#movieId"),
            @CacheEvict(value = "movies-page", allEntries = true),
            @CacheEvict(value = "coming-soon-movies-page", allEntries = true),
            @CacheEvict(value = "now-showing-movies-page", allEntries = true),
            @CacheEvict(value = "top-rated-movies-page", allEntries = true)
    })
    public void deleteMovie(Long movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new AppException("Movie not found with id: " + movieId,
                        ErrorCode.MODEL_NOT_FOUND));
        movieRepository.delete(movie);
    }

    @Cacheable(value = "movies-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize ", unless = "#result == null")
    public Object getAllMovies(Pageable pageable) {
        Page<Movie> moviePage = movieRepository.findAll(pageable);
        if (moviePage.isEmpty()) {
            throw new AppException("No movies found", ErrorCode.MODEL_NOT_FOUND);
        }
        return pageMapper.toPageResponse(moviePage, movieMapper::mapToListItem);
    }

    @Cacheable(value = "coming-soon-movies-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize ", unless = "#result == null")
    public Object getComingSoonMovies(Pageable pageable) {
        Page<Movie> moviePage = movieRepository.findMovieByStatus(MovieStatus.COMING_SOON, pageable);
        if (moviePage.isEmpty()) {
            throw new AppException("No coming soon movies found", ErrorCode.MODEL_NOT_FOUND);
        }
        return pageMapper.toPageResponse(moviePage, movieMapper::mapToListItem);
    }

    @Cacheable(value = "now-showing-movies-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize ", unless = "#result == null")
    public Object getNowShowingMovies(Pageable pageable) {
        Page<Movie> moviePage = movieRepository.findMovieByStatus(MovieStatus.NOW_SHOWING, pageable);
        if (moviePage.isEmpty()) {
            throw new AppException("No now showing movies found", ErrorCode.MODEL_NOT_FOUND);
        }
        return pageMapper.toPageResponse(moviePage, movieMapper::mapToListItem);
    }

    public Page<MovieListItemResponse> searchMovies(MovieSearchRequest request, Pageable pageable) {
        if (request == null) {
            throw new AppException("At least one search parameter is required", ErrorCode.INVALID_REQUEST);
        }

        Specification<Movie> spec = movieSpecification.build(request);

        Page<Movie> moviePage = movieRepository.findAll(spec, pageable);

        if (moviePage.isEmpty()) {
            throw new AppException("No movies found matching the search criteria", ErrorCode.MODEL_NOT_FOUND);
        }
        return moviePage.map(movieMapper::mapToListItem);
    }

    @Cacheable(value = "top-rated-movies-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize ", unless = "#result == null")
    public Object getTopRatedMovies(Pageable pageable) {
        Page<Movie> moviePage = movieRepository.findTopRatedMovies(pageable);
        if (moviePage.isEmpty()) {
            throw new AppException("No top rated movies found", ErrorCode.MODEL_NOT_FOUND);
        }
        return pageMapper.toPageResponse(moviePage, movieMapper::mapToListItem);
    }

    public void addGenreToMovie(Movie movie, Long genreId) {
        Genre genre = genreRepository.findById(genreId)
                .orElseThrow(() -> new AppException("Genre not found with id: " + genreId,
                        ErrorCode.MODEL_NOT_FOUND));

        MovieGenre movieGenre = MovieGenre.builder()
                .genre(genre)
                .movie(movie)
                .build();

        movieGenreRepository.save(movieGenre);
    }

    public void removeAllGenresFromMovie(Movie movie) {
        List<MovieGenre> movieGenres = movieGenreRepository.findMovieGenresByMovie_Id(movie.getId());
        movieGenreRepository.deleteAll(movieGenres);
    }
}
