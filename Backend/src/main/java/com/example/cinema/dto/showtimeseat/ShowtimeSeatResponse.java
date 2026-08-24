package com.example.cinema.dto.showtimeseat;

import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeSeatResponse {

    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID showtimeId;
    private UUID seatId;
    private String name;
    private String rowLabel;
    private Integer row;
    private Integer col;
    private String seatType;
    private BigDecimal price;
    private ShowtimeSeatStatus status;
    private UUID heldByUserId;
    private UUID lockedByUserId;
    private UUID holdToken;
    private ZonedDateTime heldAt;
    private ZonedDateTime holdExpiresAt;
    private UUID bookingId;
    private Long version;
}
