package com.example.hotcinemas_be.dtos.seat.responses;

import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatResponse {
    private Long id;
    private String name;
    private SeatType seatType;
    private SeatStatus status;
    private Integer col;
    private Integer row;
}
