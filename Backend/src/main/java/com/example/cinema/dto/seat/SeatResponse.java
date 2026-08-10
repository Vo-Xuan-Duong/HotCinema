package com.example.cinema.dto.seat;

import java.time.ZonedDateTime;
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
public class SeatResponse {

    private java.util.UUID id;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    private java.util.UUID auditoriumId;
    private java.util.UUID seatTypeId;
    private String rowLabel;
    private Integer seatNumber;
    private String displayName;
    private Integer xPosition;
    private Integer yPosition;
    private SeatStatus status;
}
