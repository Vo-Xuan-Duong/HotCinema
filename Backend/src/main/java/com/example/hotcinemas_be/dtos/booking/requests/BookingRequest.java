package com.example.hotcinemas_be.dtos.booking.requests;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BookingRequest {

    @NotNull(message = "Showtime ID is required")
    @Positive(message = "Showtime ID must be positive")
    private Long showtimeId;

    @NotEmpty(message = "At least one seat must be selected")
    @JsonProperty("seatIds")
    private List<Long> seatIds;

    private String promotionCode;
}
