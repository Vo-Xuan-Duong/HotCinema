package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ShowtimeService {
    List<ShowtimeResponse> findAll();
    PageResponse<ShowtimeResponse> findPage(Pageable pageable);
    ShowtimeResponse findById(UUID id);
    ShowtimeResponse create(ShowtimeCreateRequest request);
    ShowtimeResponse update(UUID id, ShowtimeUpdateRequest request);
    void deleteById(UUID id);
}
