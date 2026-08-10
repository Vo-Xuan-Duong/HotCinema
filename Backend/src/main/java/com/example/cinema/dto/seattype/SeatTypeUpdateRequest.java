package com.example.cinema.dto.seattype;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatTypeUpdateRequest {

    private String code;
    private String name;
    private String description;
    private BigDecimal priceModifier;
}
