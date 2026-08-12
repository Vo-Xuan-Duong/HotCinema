package com.example.cinema.service;

import com.example.cinema.entity.Genre;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface GenreService {
    Page<Genre> findAll(Pageable pageable);
    Optional<Genre> findById(UUID id);
    Genre save(Genre entity);
    void deleteById(UUID id);
}
