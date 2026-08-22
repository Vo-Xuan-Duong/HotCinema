package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.moviemedia.MovieMediaCreateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaUpdateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface MovieMediaService {
    List<MovieMediaResponse> findAll();
    PageResponse<MovieMediaResponse> findPage(Pageable pageable);
    MovieMediaResponse findById(UUID id);
    MovieMediaResponse create(MovieMediaCreateRequest request);
    MovieMediaResponse update(UUID id, MovieMediaUpdateRequest request);
    void deleteById(UUID id);
}
