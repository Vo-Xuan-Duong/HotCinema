package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.MovieMedia;
import com.example.cinema.dto.moviemedia.MovieMediaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface MovieMediaService {
    List<MovieMediaResponse> findAll();
    PageResponse<MovieMediaResponse> findPage(Pageable pageable);
    Optional<MovieMedia> findById(UUID id);
    MovieMedia save(MovieMedia entity);
    void deleteById(UUID id);
}
