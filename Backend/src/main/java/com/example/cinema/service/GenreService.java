package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.genre.GenreCreateRequest;
import com.example.cinema.dto.genre.GenreUpdateRequest;
import com.example.cinema.dto.genre.GenreResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface GenreService {
    List<GenreResponse> findAll();
    PageResponse<GenreResponse> findPage(Pageable pageable);
    GenreResponse findById(UUID id);
    GenreResponse create(GenreCreateRequest request);
    GenreResponse update(UUID id, GenreUpdateRequest request);
    void deleteById(UUID id);
}
