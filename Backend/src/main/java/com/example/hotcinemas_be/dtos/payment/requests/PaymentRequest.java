package com.example.hotcinemas_be.dtos.payment.requests;

import com.example.hotcinemas_be.enums.PaymentMethod;
import com.example.hotcinemas_be.enums.PaymentStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentRequest {

    @NotNull(message = "Booking ID is required")
    private Long bookingId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String paymentDetails;
}
