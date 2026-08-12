package com.example.cinema.service;

import com.example.cinema.entity.Cinema;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface CinemaService {
    Page<Cinema> findAll(Pageable pageable);
    Optional<Cinema> findById(UUID id);
    Cinema save(Cinema entity);
    void deleteById(UUID id);
}
