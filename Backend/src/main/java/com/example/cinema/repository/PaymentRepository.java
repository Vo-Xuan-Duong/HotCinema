package com.example.cinema.repository;

import com.example.cinema.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Page<Payment> findAllByIsActiveTrue(Pageable pageable);

    Optional<Payment> findByIdAndIsActiveTrue(UUID id);
}
