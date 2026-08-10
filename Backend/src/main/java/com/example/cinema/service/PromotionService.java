package com.example.cinema.service;

import com.example.cinema.entity.Promotion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PromotionService {
    List<Promotion> findAll();
    Optional<Promotion> findById(UUID id);
    Promotion save(Promotion entity);
    void deleteById(UUID id);
}
