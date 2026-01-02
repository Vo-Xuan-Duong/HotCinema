package com.example.hotcinemas_be.dtos.showtime.responses;

import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowtimeSeatResponse {
    private Long id;
    private String name;
    private SeatType seatType;
    private SeatStatus status;
    private BigDecimal price;
    private Integer col;
    private Integer row;
    private long lockedByUserId;
}

