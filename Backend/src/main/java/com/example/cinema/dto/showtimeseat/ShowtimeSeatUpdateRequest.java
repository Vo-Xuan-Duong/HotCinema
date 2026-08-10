package com.example.cinema.dto.showtimeseat;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSeatUpdateRequest {

    private java.util.UUID showtimeId;
    private java.util.UUID seatId;
    private BigDecimal price;
    private ShowtimeSeatStatus status;
    private java.util.UUID heldByUserId;
    private UUID holdToken;
    private ZonedDateTime heldAt;
    private ZonedDateTime holdExpiresAt;
    private java.util.UUID bookingId;
}
