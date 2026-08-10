package com.example.cinema.dto.seattype;

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
public class SeatTypeResponse {

    private UUID id;
    private String code;
    private String name;
    private String description;
    private BigDecimal priceModifier;
    private ZonedDateTime createdAt;
}
