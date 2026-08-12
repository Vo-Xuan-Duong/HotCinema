package com.example.cinema.dto.ticketscan;

import jakarta.validation.constraints.*;

import java.util.UUID;

import com.example.cinema.entity.Ticket;
import com.example.cinema.entity.enums.TicketScanResult;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketScanCreateRequest {

    @NotNull

    private Ticket ticket;
    private java.util.UUID cinemaId;
    private java.util.UUID scannedById;
    @NotNull
    private TicketScanResult result;
    @NotNull
    private ZonedDateTime scannedAt;
    @NotBlank
    private String deviceInfo;
}
