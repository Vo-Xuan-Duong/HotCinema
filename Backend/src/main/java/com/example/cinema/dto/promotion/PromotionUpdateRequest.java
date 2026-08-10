package com.example.cinema.dto.promotion;

import java.time.ZonedDateTime;

import com.example.cinema.entity.enums.PromotionDiscountType;
import com.example.cinema.entity.enums.PromotionStatus;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PromotionUpdateRequest {

    private String name;
    private String description;
    private PromotionDiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountAmount;
    private BigDecimal minimumOrderAmount;
    private ZonedDateTime startAt;
    private ZonedDateTime endAt;
    private Integer usageLimit;
    private Integer usagePerUser;
    private PromotionStatus status;
}
