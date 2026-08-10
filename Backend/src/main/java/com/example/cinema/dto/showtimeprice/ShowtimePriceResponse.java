package com.example.cinema.dto.showtimeprice;

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
public class ShowtimePriceResponse {

    private UUID id;
    private java.util.UUID showtimeId;
    private java.util.UUID seatTypeId;
    private BigDecimal price;
    private ZonedDateTime createdAt;
}
