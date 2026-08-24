package com.example.cinema.dto.ticketscan;

import com.example.cinema.entity.enums.TicketScanResult;
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
public class TicketScanResponse {

    private UUID id;
    private UUID ticketId;
    private String ticketCode;
    private UUID cinemaId;
    private UUID scannedById;
    private TicketScanResult result;
    private ZonedDateTime scannedAt;
    private String deviceInfo;
}
