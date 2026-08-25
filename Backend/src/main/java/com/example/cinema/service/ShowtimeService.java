package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.entity.enums.ShowtimeStatus;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ShowtimeService {
    List<ShowtimeResponse> findAll();
    PageResponse<ShowtimeResponse> findPage(Pageable pageable);
    List<ShowtimeResponse> search(
            UUID movieId,
            UUID cinemaId,
            UUID auditoriumId,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            ShowtimeStatus status
    );
    ShowtimeResponse findById(UUID id);
    ShowtimeResponse create(ShowtimeCreateRequest request);
    ShowtimeResponse update(UUID id, ShowtimeUpdateRequest request);
    void deleteById(UUID id);
}
