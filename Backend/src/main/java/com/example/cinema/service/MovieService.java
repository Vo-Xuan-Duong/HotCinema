package com.example.cinema.service;

import com.example.cinema.entity.Movie;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface MovieService {
    Page<Movie> findAll(Pageable pageable);
    Optional<Movie> findById(UUID id);
    Movie save(Movie entity);
    void deleteById(UUID id);
}
