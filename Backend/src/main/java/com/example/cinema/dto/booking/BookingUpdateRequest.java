package com.example.cinema.dto.booking;

import com.example.cinema.entity.enums.BookingStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
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
public class BookingUpdateRequest {

    @NotBlank
    private String bookingCode;

    private UUID userId;

    @NotNull
    private UUID showtimeId;

    @NotBlank
    private String customerName;

    @NotBlank
    @Email
    private String customerEmail;

    @NotBlank
    private String customerPhone;

    @NotNull
    private BookingStatus status;

    @NotNull
    @PositiveOrZero
    private BigDecimal seatAmount;

    @NotNull
    @PositiveOrZero
    private BigDecimal foodAmount;

    @NotNull
    @PositiveOrZero
    private BigDecimal discountAmount;

    @NotNull
    @PositiveOrZero
    private BigDecimal subtotal;

    @NotNull
    @PositiveOrZero
    private BigDecimal totalAmount;

    @NotBlank
    private String currency;

    @NotNull
    private ZonedDateTime expiresAt;

    private ZonedDateTime paidAt;
    private ZonedDateTime cancelledAt;
}
