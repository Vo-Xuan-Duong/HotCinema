package com.example.cinema.dto.bookingpromotion;

import java.util.UUID;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingPromotionCreateRequest {

    private java.util.UUID bookingId;
    private java.util.UUID promotionId;
    private java.util.UUID promotionCodeId;
    private BigDecimal discountAmount;
}
