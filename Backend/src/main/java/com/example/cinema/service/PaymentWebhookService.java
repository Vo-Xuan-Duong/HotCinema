package com.example.cinema.service;

import com.example.cinema.entity.PaymentWebhook;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PaymentWebhookService {
    Page<PaymentWebhook> findAll(Pageable pageable);
    Optional<PaymentWebhook> findById(UUID id);
    PaymentWebhook save(PaymentWebhook entity);
    void deleteById(UUID id);
}
