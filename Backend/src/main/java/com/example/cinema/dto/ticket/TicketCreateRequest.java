package com.example.cinema.dto.ticket;

import jakarta.validation.constraints.*;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.example.cinema.entity.enums.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketCreateRequest {

    @NotBlank

    private String ticketCode;
    private java.util.UUID bookingId;
    private java.util.UUID bookingSeatId;
    @NotNull
    private UUID qrToken;
    @NotNull
    private TicketStatus status;
    @NotNull
    private ZonedDateTime issuedAt;
    @NotNull
    private ZonedDateTime checkedInAt;
    private java.util.UUID checkedInById;
}
