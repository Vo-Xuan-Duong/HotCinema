package com.example.cinema.dto.cinemaproduct;

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
public class CinemaProductResponse {

    private java.util.UUID id;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    private java.util.UUID cinemaId;
    private java.util.UUID productId;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isAvailable;
}
