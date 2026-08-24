package com.example.cinema.dto.payment;

import com.example.cinema.entity.enums.PaymentProvider;
import com.example.cinema.entity.enums.PaymentStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCreateRequest {

    @NotNull
    private UUID bookingId;

    @NotNull
    private PaymentProvider provider;

    @NotBlank
    private String paymentMethod;

    @NotNull
    @Positive
    private BigDecimal amount;

    @NotBlank
    private String currency;

    @NotNull
    private PaymentStatus status;

    @NotBlank
    private String idempotencyKey;

    private String providerOrderId;
    private String providerTransactionId;
    private String requestId;
    private String paymentUrl;
    private String failureCode;
    private String failureMessage;
    private ZonedDateTime paidAt;
}
