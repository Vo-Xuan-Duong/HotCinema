package com.example.hotcinemas_be.dtos.seat.requests;

import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeatRequest {

    @NotNull(message = "Theater ID is required")
    private Long theaterId;

    @NotBlank(message = "Seat name is required")
    private String name;

    private SeatType seatType;

    private SeatStatus seatStatus;

    @NotNull(message = "Column position is required")
    private Integer col;

    @NotNull(message = "Row position is required")
    private Integer row;
}
