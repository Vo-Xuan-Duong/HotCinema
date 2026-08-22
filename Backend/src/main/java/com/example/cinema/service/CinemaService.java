package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.cinema.CinemaCreateRequest;
import com.example.cinema.dto.cinema.CinemaUpdateRequest;
import com.example.cinema.dto.cinema.CinemaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface CinemaService {
    List<CinemaResponse> findAll();
    PageResponse<CinemaResponse> findPage(Pageable pageable);
    CinemaResponse findById(UUID id);
    CinemaResponse create(CinemaCreateRequest request);
    CinemaResponse update(UUID id, CinemaUpdateRequest request);
    void deleteById(UUID id);
}
