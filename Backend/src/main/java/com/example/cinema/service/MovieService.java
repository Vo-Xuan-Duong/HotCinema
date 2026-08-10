package com.example.cinema.service;

import com.example.cinema.entity.Movie;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MovieService {
    List<Movie> findAll();
    Optional<Movie> findById(UUID id);
    Movie save(Movie entity);
    void deleteById(UUID id);
}
