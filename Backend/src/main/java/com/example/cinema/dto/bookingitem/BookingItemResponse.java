package com.example.cinema.dto.bookingitem;

import java.time.ZonedDateTime;
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
public class BookingItemResponse {

    private UUID id;
    private java.util.UUID bookingId;
    private java.util.UUID productId;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private ZonedDateTime createdAt;
}
