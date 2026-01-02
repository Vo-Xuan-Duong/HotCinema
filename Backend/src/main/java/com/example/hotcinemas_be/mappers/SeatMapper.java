package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.seat.responses.SeatResponse;
import com.example.hotcinemas_be.models.Seat;
import org.springframework.stereotype.Service;

@Service
public class SeatMapper {
    public SeatResponse mapToResponse(Seat seat) {
        if (seat == null) {
            return null;
        }
        return SeatResponse.builder()
                .id(seat.getId())
                .name(seat.getName())
                .seatType(seat.getSeatType())
                .status(seat.getSeatStatus())
                .col(seat.getCol())
                .row(seat.getRow())
                .build();
    }
}
