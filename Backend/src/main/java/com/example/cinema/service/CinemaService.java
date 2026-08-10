package com.example.cinema.service;

import com.example.cinema.entity.Cinema;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CinemaService {
    List<Cinema> findAll();
    Optional<Cinema> findById(UUID id);
    Cinema save(Cinema entity);
    void deleteById(UUID id);
}
