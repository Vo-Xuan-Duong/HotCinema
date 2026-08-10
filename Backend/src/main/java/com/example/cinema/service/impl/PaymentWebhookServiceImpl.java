package com.example.cinema.service.impl;

import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.repository.PaymentWebhookRepository;
import com.example.cinema.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentWebhookServiceImpl implements PaymentWebhookService {

    private final PaymentWebhookRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentWebhook> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentWebhook> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public PaymentWebhook save(PaymentWebhook entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
