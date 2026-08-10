package com.example.cinema.dto.bookingstatushistory;

import java.util.UUID;

import com.example.cinema.entity.enums.BookingStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusHistoryUpdateRequest {

    private java.util.UUID bookingId;
    private BookingStatus fromStatus;
    private BookingStatus toStatus;
    private java.util.UUID changedById;
    private String reason;
}
