package com.example.cinema.service;

import com.example.cinema.entity.Promotion;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PromotionService {
    Page<Promotion> findAll(Pageable pageable);
    Optional<Promotion> findById(UUID id);
    Promotion save(Promotion entity);
    void deleteById(UUID id);
}
