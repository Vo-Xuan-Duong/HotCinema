package com.example.hotcinemas_be.dtos.theater.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class TheaterResponse {
    private Long id;
    private String name;
    private String theaterType;
    private Integer totalSeats;
    private String screenType;
    private String soundSystem;
    private LocalDateTime createdAt;
}

