package com.example.cinema.service;

import com.example.cinema.entity.PaymentTransaction;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionService {
    Page<PaymentTransaction> findAll(Pageable pageable);
    Optional<PaymentTransaction> findById(UUID id);
    PaymentTransaction save(PaymentTransaction entity);
    void deleteById(UUID id);
}
