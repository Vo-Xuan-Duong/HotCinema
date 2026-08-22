package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Cinema;
import com.example.cinema.dto.cinema.CinemaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface CinemaService {
    List<CinemaResponse> findAll();
    PageResponse<CinemaResponse> findPage(Pageable pageable);
    Optional<Cinema> findById(UUID id);
    Cinema save(Cinema entity);
    void deleteById(UUID id);
}
