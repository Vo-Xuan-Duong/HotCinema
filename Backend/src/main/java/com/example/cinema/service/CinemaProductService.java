package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface CinemaProductService {
    List<CinemaProductResponse> findAll();
    PageResponse<CinemaProductResponse> findPage(Pageable pageable);
    CinemaProductResponse findById(UUID id);
    CinemaProductResponse create(CinemaProductCreateRequest request);
    CinemaProductResponse update(UUID id, CinemaProductUpdateRequest request);
    void deleteById(UUID id);
}
