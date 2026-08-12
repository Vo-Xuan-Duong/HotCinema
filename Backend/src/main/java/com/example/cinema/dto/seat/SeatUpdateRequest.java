package com.example.cinema.dto.seat;

import jakarta.validation.constraints.*;

import java.util.UUID;

import com.example.cinema.entity.enums.SeatStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SeatUpdateRequest {

    private java.util.UUID auditoriumId;
    private java.util.UUID seatTypeId;
    @NotBlank
    private String rowLabel;
    @NotNull
    private Integer seatNumber;
    @NotBlank
    private String displayName;
    @NotNull
    private Integer xPosition;
    @NotNull
    private Integer yPosition;
    @NotNull
    private SeatStatus status;
}
