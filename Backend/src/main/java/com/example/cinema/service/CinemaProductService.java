package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface CinemaProductService {
    List<CinemaProductResponse> findAll();
    List<CinemaProductResponse> findAvailableByCinema(UUID cinemaId);
    PageResponse<CinemaProductResponse> findPage(Pageable pageable);
    CinemaProductResponse findById(UUID id);
    CinemaProductResponse create(CinemaProductCreateRequest request);
    CinemaProductResponse update(UUID id, CinemaProductUpdateRequest request);
    void deleteById(UUID id);
}
