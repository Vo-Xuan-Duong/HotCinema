package com.example.cinema.dto.booking;

import com.example.cinema.entity.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {

    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String bookingCode;
    private UUID userId;
    private UUID showtimeId;
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

    private String movieTitle;
    private String moviePosterUrl;
    private String cinemaName;
    private String cinemaAddress;
    private String roomName;
    private ZonedDateTime showtimeStartTime;
    private ZonedDateTime showtimeEndTime;
    private String showtimeFormat;
    private String language;
    private String subtitle;
}
