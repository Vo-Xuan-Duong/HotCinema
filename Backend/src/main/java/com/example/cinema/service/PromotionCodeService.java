package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.PromotionCode;
import com.example.cinema.dto.promotioncode.PromotionCodeResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PromotionCodeService {
    List<PromotionCodeResponse> findAll();
    PageResponse<PromotionCodeResponse> findPage(Pageable pageable);
    Optional<PromotionCode> findById(UUID id);
    PromotionCode save(PromotionCode entity);
    void deleteById(UUID id);
}
