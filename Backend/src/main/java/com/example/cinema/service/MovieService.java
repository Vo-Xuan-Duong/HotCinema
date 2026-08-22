package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Movie;
import com.example.cinema.dto.movie.MovieResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface MovieService {
    List<MovieResponse> findAll();
    PageResponse<MovieResponse> findPage(Pageable pageable);
    Optional<Movie> findById(UUID id);
    Movie save(Movie entity);
    void deleteById(UUID id);
}
