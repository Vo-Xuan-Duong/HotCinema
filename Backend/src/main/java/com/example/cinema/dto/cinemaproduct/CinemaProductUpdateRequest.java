package com.example.cinema.dto.cinemaproduct;

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
public class CinemaProductUpdateRequest {

    private java.util.UUID cinemaId;
    private java.util.UUID productId;
    @NotNull
    private BigDecimal price;
    @NotNull
    private Integer stockQuantity;
    @NotNull
    private Boolean isAvailable;
}
