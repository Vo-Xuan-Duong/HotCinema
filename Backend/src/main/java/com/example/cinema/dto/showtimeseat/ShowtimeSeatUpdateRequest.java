package com.example.cinema.dto.showtimeseat;

import jakarta.validation.constraints.*;

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
    @NotNull
    private BigDecimal price;
    @NotNull
    private ShowtimeSeatStatus status;
    private java.util.UUID heldByUserId;
    @NotNull
    private UUID holdToken;
    @NotNull
    private ZonedDateTime heldAt;
    @NotNull
    private ZonedDateTime holdExpiresAt;
    private java.util.UUID bookingId;
}
