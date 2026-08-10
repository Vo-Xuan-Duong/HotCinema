package com.example.cinema.entity;

import com.example.cinema.entity.enums.PromotionDiscountType;
import com.example.cinema.entity.enums.PromotionStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Promotion extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 30)
    private PromotionDiscountType discountType;

    @Column(name = "discount_value", nullable = false, precision = 12, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "max_discount_amount", precision = 12, scale = 2)
    private BigDecimal maxDiscountAmount;

    @Column(name = "minimum_order_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal minimumOrderAmount;

    @Column(name = "start_at", nullable = false)
    private ZonedDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private ZonedDateTime endAt;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "usage_per_user")
    private Integer usagePerUser;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PromotionStatus status;
}
