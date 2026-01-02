package com.example.hotcinemas_be.dtos.promotion.responses;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.hotcinemas_be.enums.DiscountType;
import jakarta.persistence.Column;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PromotionResponse {
    private Long id;
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
    private Boolean isActive;
    private LocalDateTime createdAt;
}

