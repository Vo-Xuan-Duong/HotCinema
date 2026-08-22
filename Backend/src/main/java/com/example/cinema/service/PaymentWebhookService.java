package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PaymentWebhookService {
    List<PaymentWebhookResponse> findAll();
    PageResponse<PaymentWebhookResponse> findPage(Pageable pageable);
    Optional<PaymentWebhook> findById(UUID id);
    PaymentWebhook save(PaymentWebhook entity);
    void deleteById(UUID id);
}
