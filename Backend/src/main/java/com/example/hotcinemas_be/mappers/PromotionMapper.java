package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.promotion.responses.PromotionResponse;
import com.example.hotcinemas_be.models.Promotion;
import org.springframework.stereotype.Service;

@Service
public class PromotionMapper {
    public PromotionResponse mapToResponse(Promotion promotion) {
        if (promotion == null) {
            return null;
        }

        return PromotionResponse.builder()
                .id(promotion.getId())
                .code(promotion.getCode())
                .name(promotion.getName())
                .description(promotion.getDescription())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .minPurchase(promotion.getMinPurchase())
                .maxDiscount(promotion.getMaxDiscount())
                .usageLimit(promotion.getUsageLimit())
                .usedCount(promotion.getUsedCount())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .isActive(promotion.getIsActive())
                .createdAt(promotion.getCreatedAt())
                .build();
    }
}
