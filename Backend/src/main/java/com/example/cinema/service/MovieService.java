package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.movie.MovieCreateRequest;
import com.example.cinema.dto.movie.MovieResponse;
import com.example.cinema.dto.movie.MovieUpdateRequest;
import com.example.cinema.entity.enums.MovieStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface MovieService {
    List<MovieResponse> findAll();
    PageResponse<MovieResponse> findPage(Pageable pageable);
    PageResponse<MovieResponse> search(String keyword, String genre, MovieStatus status, Integer releaseYear, Pageable pageable);
    MovieResponse findById(UUID id);
    MovieResponse create(MovieCreateRequest request);
    MovieResponse update(UUID id, MovieUpdateRequest request);
    void deleteById(UUID id);
}
