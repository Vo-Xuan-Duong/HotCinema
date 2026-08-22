package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Auditorium;
import com.example.cinema.dto.auditorium.AuditoriumResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface AuditoriumService {
    List<AuditoriumResponse> findAll();
    PageResponse<AuditoriumResponse> findPage(Pageable pageable);
    Optional<Auditorium> findById(UUID id);
    Auditorium save(Auditorium entity);
    void deleteById(UUID id);
}
