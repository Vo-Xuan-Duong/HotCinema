package com.example.cinema.service;

import com.example.cinema.entity.Showtime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimeService {
    List<Showtime> findAll();
    Optional<Showtime> findById(UUID id);
    Showtime save(Showtime entity);
    void deleteById(UUID id);
}
