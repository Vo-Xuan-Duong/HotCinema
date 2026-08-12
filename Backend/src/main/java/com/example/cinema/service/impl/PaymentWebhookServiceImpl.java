package com.example.cinema.service.impl;

import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.repository.PaymentWebhookRepository;
import com.example.cinema.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentWebhookServiceImpl implements PaymentWebhookService {

    private final PaymentWebhookRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentWebhook> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "paymentwebhooks", key = "#id")
    public Optional<PaymentWebhook> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", key = "#result.id")
    public PaymentWebhook save(PaymentWebhook entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
