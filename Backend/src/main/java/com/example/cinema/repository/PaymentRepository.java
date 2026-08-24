package com.example.cinema.repository;

import com.example.cinema.entity.Payment;
import com.example.cinema.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findAllByIsActiveTrue(Pageable pageable);

    Page<Payment> findAllByStatusAndIsActiveTrue(PaymentStatus status, Pageable pageable);

    Optional<Payment> findByIdAndIsActiveTrue(UUID id);

    Optional<Payment> findByIdAndBooking_User_IdAndIsActiveTrue(UUID id, UUID userId);

    List<Payment> findAllByBooking_IdAndIsActiveTrue(UUID bookingId);

    List<Payment> findAllByBooking_IdAndBooking_User_IdAndIsActiveTrue(UUID bookingId, UUID userId);

    Optional<Payment> findByProviderTransactionIdAndIsActiveTrue(String providerTransactionId);

    Optional<Payment> findByIdempotencyKeyAndIsActiveTrue(String idempotencyKey);
}
