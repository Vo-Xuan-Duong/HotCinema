package com.example.cinema.dto.promotion;

import jakarta.validation.constraints.*;

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
public class PromotionCreateRequest {

    @NotBlank

    private String name;
    @NotBlank
    private String description;
    @NotNull
    private PromotionDiscountType discountType;
    @NotNull
    private BigDecimal discountValue;
    @NotNull
    private BigDecimal maxDiscountAmount;
    @NotNull
    private BigDecimal minimumOrderAmount;
    @NotNull
    private ZonedDateTime startAt;
    @NotNull
    private ZonedDateTime endAt;
    @NotNull
    private Integer usageLimit;
    @NotNull
    private Integer usagePerUser;
    @NotNull
    private PromotionStatus status;
}
