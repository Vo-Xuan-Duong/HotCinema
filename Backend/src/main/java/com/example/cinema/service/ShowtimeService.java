package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Showtime;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimeService {
    List<ShowtimeResponse> findAll();
    PageResponse<ShowtimeResponse> findPage(Pageable pageable);
    Optional<Showtime> findById(UUID id);
    Showtime save(Showtime entity);
    void deleteById(UUID id);
}
