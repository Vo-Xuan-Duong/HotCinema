package com.example.hotcinemas_be.dtos.payment.responses;

import com.example.hotcinemas_be.dtos.momo.MomoResponse;
import com.example.hotcinemas_be.enums.PaymentMethod;
import com.example.hotcinemas_be.enums.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {
    private Long id;
    private Long userId;
    private String fullName;
    private String email;
    private Long bookingId;
    private String bookingCode;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus paymentStatus;
    private String transactionId;
    private String paymentDetails;
    private LocalDateTime paymentDate;
    private LocalDateTime createdAt;
    private String paymentUrl; // For online payments
}
