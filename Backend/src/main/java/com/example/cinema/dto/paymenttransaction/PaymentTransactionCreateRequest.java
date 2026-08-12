package com.example.cinema.dto.paymenttransaction;

import jakarta.validation.constraints.*;

import com.example.cinema.entity.Payment;
import com.example.cinema.entity.enums.PaymentTransactionStatus;
import com.example.cinema.entity.enums.PaymentTransactionType;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransactionCreateRequest {

    @NotNull

    private Payment payment;
    @NotNull
    private PaymentTransactionType transactionType;
    @NotBlank
    private String providerTransactionId;
    @NotNull
    private BigDecimal amount;
    @NotNull
    private PaymentTransactionStatus status;
    @NotBlank
    private String requestPayload;
    @NotBlank
    private String responsePayload;
}
