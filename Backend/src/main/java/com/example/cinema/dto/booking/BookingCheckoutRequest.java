package com.example.cinema.dto.booking;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCheckoutRequest {

    @NotEmpty
    @Size(max = 10)
    private List<UUID> seatIds;

    @Size(max = 100)
    private String promotionCode;
}
