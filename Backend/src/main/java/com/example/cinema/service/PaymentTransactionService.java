package com.example.cinema.service;

import com.example.cinema.entity.PaymentTransaction;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionService {
    List<PaymentTransaction> findAll();
    Optional<PaymentTransaction> findById(UUID id);
    PaymentTransaction save(PaymentTransaction entity);
    void deleteById(UUID id);
}
