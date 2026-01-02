package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.enums.PaymentStatus;
import com.example.hotcinemas_be.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByBookingId(Long bookingId);

    List<Payment> findByPaymentStatus(PaymentStatus status);

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findPaymentByBooking_BookingCode(String bookingBookingCode);

    List<Payment> findByBookingIdAndPaymentStatus(Long bookingId, PaymentStatus status);

    List<Payment> findByPaymentDateBetween(LocalDateTime startDate, LocalDateTime endDate);

    List<Payment> findByPaymentDateBetweenAndPaymentStatus(LocalDateTime startDate, LocalDateTime endDate,
            PaymentStatus status);
}
