package com.example.cinema.dto.bookingseat;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingSeatResponse {

    private UUID id;
    private java.util.UUID bookingId;
    private java.util.UUID showtimeSeatId;
    private String seatName;
    private String seatTypeName;
    private BigDecimal unitPrice;
    private ZonedDateTime createdAt;
}
