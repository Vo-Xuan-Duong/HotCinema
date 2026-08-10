package com.example.cinema.dto.cinemaproduct;

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
public class CinemaProductCreateRequest {

    private java.util.UUID cinemaId;
    private java.util.UUID productId;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isAvailable;
}
