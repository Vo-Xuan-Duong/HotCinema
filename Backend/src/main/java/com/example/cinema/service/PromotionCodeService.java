package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.promotioncode.PromotionCodeCreateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeUpdateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface PromotionCodeService {
    List<PromotionCodeResponse> findAll();
    PageResponse<PromotionCodeResponse> findPage(Pageable pageable);
    PromotionCodeResponse findById(UUID id);
    PromotionCodeResponse create(PromotionCodeCreateRequest request);
    PromotionCodeResponse update(UUID id, PromotionCodeUpdateRequest request);
    void deleteById(UUID id);
}
