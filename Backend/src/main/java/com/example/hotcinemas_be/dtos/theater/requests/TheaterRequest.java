package com.example.hotcinemas_be.dtos.theater.requests;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomRequest {
    private String name;
    private RoomType roomType;
    private Integer rowsCount;
    private Integer seatsPerRow;
    private List<Long> rowVip;
    private BigDecimal price;
    private Boolean isActive;
}

