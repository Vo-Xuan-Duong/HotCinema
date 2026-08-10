package com.example.cinema.service;

import com.example.cinema.entity.Payment;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentService {
    List<Payment> findAll();
    Optional<Payment> findById(UUID id);
    Payment save(Payment entity);
    void deleteById(UUID id);
}
