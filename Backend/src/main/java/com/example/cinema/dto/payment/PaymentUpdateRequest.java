package com.example.cinema.dto.payment;

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
    private PaymentProvider provider;
    private String paymentMethod;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private String idempotencyKey;
    private String providerOrderId;
    private String providerTransactionId;
    private String requestId;
    private String paymentUrl;
    private String failureCode;
    private String failureMessage;
    private ZonedDateTime paidAt;
}
