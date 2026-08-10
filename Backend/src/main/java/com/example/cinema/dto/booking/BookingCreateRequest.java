package com.example.cinema.dto.booking;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.example.cinema.entity.enums.BookingStatus;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCreateRequest {

    private String bookingCode;
    private java.util.UUID userId;
    private java.util.UUID showtimeId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private BookingStatus status;
    private BigDecimal seatAmount;
    private BigDecimal foodAmount;
    private BigDecimal discountAmount;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String currency;
    private ZonedDateTime expiresAt;
    private ZonedDateTime paidAt;
    private ZonedDateTime cancelledAt;
}
