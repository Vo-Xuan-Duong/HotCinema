package com.example.cinema.dto.payment;

import jakarta.validation.constraints.*;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.example.cinema.entity.enums.PaymentProvider;
import com.example.cinema.entity.enums.PaymentStatus;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentUpdateRequest {

    private java.util.UUID bookingId;
    @NotNull
    private PaymentProvider provider;
    @NotBlank
    private String paymentMethod;
    @NotNull
    private BigDecimal amount;
    @NotBlank
    private String currency;
    @NotNull
    private PaymentStatus status;
    @NotBlank
    private String idempotencyKey;
    @NotBlank
    private String providerOrderId;
    @NotBlank
    private String providerTransactionId;
    @NotBlank
    private String requestId;
    @NotBlank
    private String paymentUrl;
    @NotBlank
    private String failureCode;
    @NotBlank
    private String failureMessage;
    @NotNull
    private ZonedDateTime paidAt;
}
