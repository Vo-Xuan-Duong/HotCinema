package com.example.cinema.dto.bookingseat;

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
public class BookingSeatCreateRequest {

    private java.util.UUID bookingId;
    private java.util.UUID showtimeSeatId;
    private String seatName;
    private String seatTypeName;
    private BigDecimal unitPrice;
}
