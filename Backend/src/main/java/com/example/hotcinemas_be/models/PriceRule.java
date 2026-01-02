package com.example.hotcinemas_be.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;

import com.example.hotcinemas_be.enums.AdjustmentType;
import com.example.hotcinemas_be.enums.DayType;
import com.example.hotcinemas_be.enums.SeatType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "price_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PriceRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", length = 20)
    @Builder.Default
    private SeatType seatType = SeatType.ALL;

    @Enumerated(EnumType.STRING)
    @Column(name = "day_type", length = 20)
    @Builder.Default
    private DayType dayType = DayType.ALL;

    @Column(name = "time_from")
    private LocalTime timeFrom;

    @Column(name = "time_to")
    private LocalTime timeTo;

    @Column(name = "price_adjustment", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceAdjustment;

    @Enumerated(EnumType.STRING)
    @Column(name = "adjustment_type", length = 20)
    @Builder.Default
    private AdjustmentType adjustmentType = AdjustmentType.FIXED;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

}

