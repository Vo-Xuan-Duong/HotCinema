package com.example.cinema.dto.ticketscan;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TicketScanCommandRequest {

    @NotNull
    private UUID qrToken;

    @NotNull
    private UUID cinemaId;

    @Size(max = 2000)
    private String deviceInfo;
}
