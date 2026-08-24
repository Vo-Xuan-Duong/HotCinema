package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.paymentwebhook.MomoIpnResponse;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PaymentWebhookService {
    List<PaymentWebhookResponse> findAll();
    PageResponse<PaymentWebhookResponse> findPage(Pageable pageable);
    PaymentWebhookResponse findById(UUID id);
    MomoIpnResponse processMomoIpn(String payload);
    PaymentWebhookResponse create(PaymentWebhookCreateRequest request);
    PaymentWebhookResponse update(UUID id, PaymentWebhookUpdateRequest request);
    void deleteById(UUID id);
}
