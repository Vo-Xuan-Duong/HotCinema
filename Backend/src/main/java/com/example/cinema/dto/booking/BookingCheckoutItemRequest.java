package com.example.cinema.dto.booking;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingCheckoutItemRequest {

    @NotNull
    private UUID cinemaProductId;

    @NotNull
    @Min(1)
    @Max(20)
    private Integer quantity;
}
