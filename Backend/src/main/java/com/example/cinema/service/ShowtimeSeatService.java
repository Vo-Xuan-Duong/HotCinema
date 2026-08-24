package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ShowtimeSeatService {
    List<ShowtimeSeatResponse> findAll();
    List<ShowtimeSeatResponse> findByShowtime(UUID showtimeId);
    PageResponse<ShowtimeSeatResponse> findPage(Pageable pageable);
    ShowtimeSeatResponse findById(UUID id);
    ShowtimeSeatResponse holdSeat(UUID showtimeId, UUID seatId, UUID userId);
    ShowtimeSeatResponse releaseSeat(UUID showtimeId, UUID seatId, UUID userId);
    ShowtimeSeatResponse create(ShowtimeSeatCreateRequest request);
    ShowtimeSeatResponse update(UUID id, ShowtimeSeatUpdateRequest request);
    void deleteById(UUID id);
}
