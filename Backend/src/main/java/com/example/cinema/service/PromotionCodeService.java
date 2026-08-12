package com.example.cinema.service;

import com.example.cinema.entity.PromotionCode;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PromotionCodeService {
    Page<PromotionCode> findAll(Pageable pageable);
    Optional<PromotionCode> findById(UUID id);
    PromotionCode save(PromotionCode entity);
    void deleteById(UUID id);
}
