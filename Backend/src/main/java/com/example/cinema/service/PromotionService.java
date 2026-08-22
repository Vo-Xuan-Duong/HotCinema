package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Promotion;
import com.example.cinema.dto.promotion.PromotionResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PromotionService {
    List<PromotionResponse> findAll();
    PageResponse<PromotionResponse> findPage(Pageable pageable);
    Optional<Promotion> findById(UUID id);
    Promotion save(Promotion entity);
    void deleteById(UUID id);
}
