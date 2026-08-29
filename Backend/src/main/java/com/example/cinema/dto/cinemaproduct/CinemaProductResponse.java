package com.example.cinema.dto.cinemaproduct;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CinemaProductResponse {

    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID cinemaId;
    private String cinemaName;
    private UUID productId;
    private String productCode;
    private String productName;
    private String productDescription;
    private String productImageUrl;
    private String categoryCode;
    private String categoryName;
    private BigDecimal price;
    private Integer stockQuantity;
    private Boolean isAvailable;
}
