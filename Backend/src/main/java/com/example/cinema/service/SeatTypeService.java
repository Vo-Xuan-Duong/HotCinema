package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.seattype.SeatTypeCreateRequest;
import com.example.cinema.dto.seattype.SeatTypeUpdateRequest;
import com.example.cinema.dto.seattype.SeatTypeResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface SeatTypeService {
    List<SeatTypeResponse> findAll();
    PageResponse<SeatTypeResponse> findPage(Pageable pageable);
    SeatTypeResponse findById(UUID id);
    SeatTypeResponse create(SeatTypeCreateRequest request);
    SeatTypeResponse update(UUID id, SeatTypeUpdateRequest request);
    void deleteById(UUID id);
}
