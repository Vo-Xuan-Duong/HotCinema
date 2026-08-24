package com.example.cinema.dto.ticket;

import com.example.cinema.entity.enums.ShowtimeFormat;
import com.example.cinema.entity.enums.TicketStatus;
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
public class TicketResponse {

    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private String ticketCode;
    private UUID bookingId;
    private String bookingCode;
    private UUID bookingSeatId;
    private String seatName;
    private String seatTypeName;
    private BigDecimal unitPrice;
    private UUID qrToken;
    private TicketStatus status;
    private ZonedDateTime issuedAt;
    private ZonedDateTime checkedInAt;
    private UUID checkedInById;

    private UUID showtimeId;
    private String movieTitle;
    private String moviePosterUrl;
    private String cinemaName;
    private String cinemaAddress;
    private String roomName;
    private ZonedDateTime showtimeStartTime;
    private ZonedDateTime showtimeEndTime;
    private ShowtimeFormat showtimeFormat;
    private String language;
    private String subtitle;
}
