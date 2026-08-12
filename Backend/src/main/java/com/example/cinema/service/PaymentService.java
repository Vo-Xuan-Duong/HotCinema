package com.example.cinema.service;

import com.example.cinema.entity.Payment;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PaymentService {
    Page<Payment> findAll(Pageable pageable);
    Optional<Payment> findById(UUID id);
    Payment save(Payment entity);
    void deleteById(UUID id);
}
