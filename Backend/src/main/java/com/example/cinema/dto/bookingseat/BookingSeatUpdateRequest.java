package com.example.cinema.dto.bookingseat;

import jakarta.validation.constraints.*;

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
public class BookingSeatUpdateRequest {

    private java.util.UUID bookingId;
    private java.util.UUID showtimeSeatId;
    @NotBlank
    private String seatName;
    @NotBlank
    private String seatTypeName;
    @NotNull
    private BigDecimal unitPrice;
}
