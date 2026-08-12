package com.example.cinema.dto.booking;

import jakarta.validation.constraints.*;

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
public class BookingUpdateRequest {

    @NotBlank

    private String bookingCode;
    private java.util.UUID userId;
    private java.util.UUID showtimeId;
    @NotBlank
    private String customerName;
    @NotBlank
    private String customerEmail;
    @NotBlank
    private String customerPhone;
    @NotNull
    private BookingStatus status;
    @NotNull
    private BigDecimal seatAmount;
    @NotNull
    private BigDecimal foodAmount;
    @NotNull
    private BigDecimal discountAmount;
    @NotNull
    private BigDecimal subtotal;
    @NotNull
    private BigDecimal totalAmount;
    @NotBlank
    private String currency;
    @NotNull
    private ZonedDateTime expiresAt;
    @NotNull
    private ZonedDateTime paidAt;
    @NotNull
    private ZonedDateTime cancelledAt;
}
