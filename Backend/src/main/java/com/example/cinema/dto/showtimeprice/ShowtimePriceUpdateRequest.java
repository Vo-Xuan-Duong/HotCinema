package com.example.cinema.dto.showtimeprice;

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
public class ShowtimePriceUpdateRequest {

    private java.util.UUID showtimeId;
    private java.util.UUID seatTypeId;
    @NotNull
    private BigDecimal price;
}
