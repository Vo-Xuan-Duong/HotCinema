package com.example.cinema.service;

import com.example.cinema.entity.Genre;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GenreService {
    List<Genre> findAll();
    Optional<Genre> findById(UUID id);
    Genre save(Genre entity);
    void deleteById(UUID id);
}
