package com.example.hotcinemas_be.dtos.seat.responses;

import com.example.hotcinemas_be.enums.SeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class SeatUpdateForWebSocket {
    private Long seatId;
    private Long lockedByUserId;
    private SeatStatus status;

}
