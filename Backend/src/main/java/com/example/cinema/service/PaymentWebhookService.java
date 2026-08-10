package com.example.cinema.service;

import com.example.cinema.entity.PaymentWebhook;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentWebhookService {
    List<PaymentWebhook> findAll();
    Optional<PaymentWebhook> findById(UUID id);
    PaymentWebhook save(PaymentWebhook entity);
    void deleteById(UUID id);
}
