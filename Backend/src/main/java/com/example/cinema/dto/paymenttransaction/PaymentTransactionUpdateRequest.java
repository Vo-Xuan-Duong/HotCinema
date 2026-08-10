package com.example.cinema.dto.paymenttransaction;

import com.example.cinema.entity.enums.PaymentTransactionStatus;
import com.example.cinema.entity.enums.PaymentTransactionType;
import com.example.cinema.entity.Payment;
import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentTransactionUpdateRequest {

    private Payment payment;
    private PaymentTransactionType transactionType;
    private String providerTransactionId;
    private BigDecimal amount;
    private PaymentTransactionStatus status;
    private String requestPayload;
    private String responsePayload;
}
