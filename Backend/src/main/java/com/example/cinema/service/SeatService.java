package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.seat.SeatCreateRequest;
import com.example.cinema.dto.seat.SeatUpdateRequest;
import com.example.cinema.dto.seat.SeatResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface SeatService {
    List<SeatResponse> findAll();
    PageResponse<SeatResponse> findPage(Pageable pageable);
    SeatResponse findById(UUID id);
    SeatResponse create(SeatCreateRequest request);
    SeatResponse update(UUID id, SeatUpdateRequest request);
    void deleteById(UUID id);
}
