package com.example.cinema.service;

import com.example.cinema.entity.CinemaProduct;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface CinemaProductService {
    Page<CinemaProduct> findAll(Pageable pageable);
    Optional<CinemaProduct> findById(UUID id);
    CinemaProduct save(CinemaProduct entity);
    void deleteById(UUID id);
}
