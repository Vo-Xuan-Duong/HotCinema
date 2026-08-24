package com.example.cinema.dto.payment;

import com.example.cinema.entity.enums.PaymentProvider;
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
public class PaymentInitiateRequest {

    @NotNull
    private UUID bookingId;

    @NotNull
    private PaymentProvider provider;
}
