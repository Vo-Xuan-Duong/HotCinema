package com.example.cinema.dto.ticket;

import com.example.cinema.entity.enums.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketUpdateRequest {

    private String ticketCode;
    private java.util.UUID bookingId;
    private java.util.UUID bookingSeatId;
    private UUID qrToken;
    private TicketStatus status;
    private ZonedDateTime issuedAt;
    private ZonedDateTime checkedInAt;
    private java.util.UUID checkedInById;
}
