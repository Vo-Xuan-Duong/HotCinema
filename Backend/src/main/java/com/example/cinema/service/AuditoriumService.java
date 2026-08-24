package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.auditorium.AuditoriumCreateRequest;
import com.example.cinema.dto.auditorium.AuditoriumUpdateRequest;
import com.example.cinema.dto.auditorium.AuditoriumResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface AuditoriumService {
    List<AuditoriumResponse> findAll();
    List<AuditoriumResponse> findByCinema(UUID cinemaId);
    PageResponse<AuditoriumResponse> findPage(Pageable pageable);
    AuditoriumResponse findById(UUID id);
    AuditoriumResponse create(AuditoriumCreateRequest request);
    AuditoriumResponse update(UUID id, AuditoriumUpdateRequest request);
    void deleteById(UUID id);
}
