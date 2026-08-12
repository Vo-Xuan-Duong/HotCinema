package com.example.cinema.dto.bookingitem;

import jakarta.validation.constraints.*;

import java.util.UUID;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingItemCreateRequest {

    private java.util.UUID bookingId;
    private java.util.UUID productId;
    @NotBlank
    private String productName;
    @NotNull
    private Integer quantity;
    @NotNull
    private BigDecimal unitPrice;
    @NotNull
    private BigDecimal totalPrice;
}
