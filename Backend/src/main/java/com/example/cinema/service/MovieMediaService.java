package com.example.cinema.service;

import com.example.cinema.entity.MovieMedia;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MovieMediaService {
    List<MovieMedia> findAll();
    Optional<MovieMedia> findById(UUID id);
    MovieMedia save(MovieMedia entity);
    void deleteById(UUID id);
}
