package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Seat;
import com.example.cinema.dto.seat.SeatResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface SeatService {
    List<SeatResponse> findAll();
    PageResponse<SeatResponse> findPage(Pageable pageable);
    Optional<Seat> findById(UUID id);
    Seat save(Seat entity);
    void deleteById(UUID id);
}
