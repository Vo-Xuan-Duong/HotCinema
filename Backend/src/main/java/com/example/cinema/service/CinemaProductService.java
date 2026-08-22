package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.CinemaProduct;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface CinemaProductService {
    List<CinemaProductResponse> findAll();
    PageResponse<CinemaProductResponse> findPage(Pageable pageable);
    Optional<CinemaProduct> findById(UUID id);
    CinemaProduct save(CinemaProduct entity);
    void deleteById(UUID id);
}
