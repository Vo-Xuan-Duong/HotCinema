package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.payment.responses.PaymentResponse;
import com.example.hotcinemas_be.models.Payment;
import org.springframework.stereotype.Service;

@Service
public class PaymentMapper {

    public PaymentResponse mapToResponse(Payment payment) {
        if (payment == null) {
            return null;
        }

        return PaymentResponse.builder()
                .id(payment.getId())
                .userId(payment.getBooking().getUser().getId())
                .fullName(payment.getBooking().getUser().getFullName())
                .email(payment.getBooking().getUser().getEmail())
                .bookingId(payment.getBooking().getId())
                .bookingCode(payment.getBooking().getBookingCode())
                .amount(payment.getAmount())
                .paymentMethod(payment.getPaymentMethod())
                .paymentStatus(payment.getPaymentStatus())
                .transactionId(payment.getTransactionId())
                .paymentDetails(payment.getPaymentDetails())
                .paymentDate(payment.getPaymentDate())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
