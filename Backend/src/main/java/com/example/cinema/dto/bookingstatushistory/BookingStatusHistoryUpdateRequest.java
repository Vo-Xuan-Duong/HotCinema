package com.example.cinema.dto.bookingstatushistory;

import jakarta.validation.constraints.*;

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
    @NotNull
    private BookingStatus fromStatus;
    @NotNull
    private BookingStatus toStatus;
    private java.util.UUID changedById;
    @NotBlank
    private String reason;
}
