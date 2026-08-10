package com.example.cinema.service;

import com.example.cinema.entity.PromotionCode;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PromotionCodeService {
    List<PromotionCode> findAll();
    Optional<PromotionCode> findById(UUID id);
    PromotionCode save(PromotionCode entity);
    void deleteById(UUID id);
}
