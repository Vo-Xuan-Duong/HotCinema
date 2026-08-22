package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.promotion.PromotionCreateRequest;
import com.example.cinema.dto.promotion.PromotionUpdateRequest;
import com.example.cinema.dto.promotion.PromotionResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface PromotionService {
    List<PromotionResponse> findAll();
    PageResponse<PromotionResponse> findPage(Pageable pageable);
    PromotionResponse findById(UUID id);
    PromotionResponse create(PromotionCreateRequest request);
    PromotionResponse update(UUID id, PromotionUpdateRequest request);
    void deleteById(UUID id);
}
