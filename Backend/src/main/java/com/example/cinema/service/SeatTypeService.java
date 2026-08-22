package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.SeatType;
import com.example.cinema.dto.seattype.SeatTypeResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface SeatTypeService {
    List<SeatTypeResponse> findAll();
    PageResponse<SeatTypeResponse> findPage(Pageable pageable);
    Optional<SeatType> findById(UUID id);
    SeatType save(SeatType entity);
    void deleteById(UUID id);
}
