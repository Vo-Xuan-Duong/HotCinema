package com.example.hotcinemas_be.dtos.promotion.requests;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.hotcinemas_be.enums.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionRequest {
    private String code;
    private String name;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minPurchase;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}

