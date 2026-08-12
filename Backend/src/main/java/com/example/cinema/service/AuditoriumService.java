package com.example.cinema.service;

import com.example.cinema.entity.Auditorium;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface AuditoriumService {
    Page<Auditorium> findAll(Pageable pageable);
    Optional<Auditorium> findById(UUID id);
    Auditorium save(Auditorium entity);
    void deleteById(UUID id);
}
