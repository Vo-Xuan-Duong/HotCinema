package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Genre;
import com.example.cinema.dto.genre.GenreResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface GenreService {
    List<GenreResponse> findAll();
    PageResponse<GenreResponse> findPage(Pageable pageable);
    Optional<Genre> findById(UUID id);
    Genre save(Genre entity);
    void deleteById(UUID id);
}
