package com.example.cinema.service;

import com.example.cinema.entity.Showtime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimeService {
    Page<Showtime> findAll(Pageable pageable);
    Optional<Showtime> findById(UUID id);
    Showtime save(Showtime entity);
    void deleteById(UUID id);
}
