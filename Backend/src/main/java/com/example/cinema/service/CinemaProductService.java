package com.example.cinema.service;

import com.example.cinema.entity.CinemaProduct;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CinemaProductService {
    List<CinemaProduct> findAll();
    Optional<CinemaProduct> findById(UUID id);
    CinemaProduct save(CinemaProduct entity);
    void deleteById(UUID id);
}
