package com.example.cinema.dto.bookingstatushistory;

import com.example.cinema.entity.enums.BookingStatus;

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
public class BookingStatusHistoryResponse {

    private UUID id;
    private java.util.UUID bookingId;
    private BookingStatus fromStatus;
    private BookingStatus toStatus;
    private java.util.UUID changedById;
    private String reason;
    private ZonedDateTime createdAt;
}
