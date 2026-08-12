package com.example.cinema.service;

import com.example.cinema.entity.MovieMedia;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface MovieMediaService {
    Page<MovieMedia> findAll(Pageable pageable);
    Optional<MovieMedia> findById(UUID id);
    MovieMedia save(MovieMedia entity);
    void deleteById(UUID id);
}
