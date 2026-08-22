package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import com.example.cinema.mapper.PaymentWebhookMapper;
import com.example.cinema.repository.PaymentWebhookRepository;
import com.example.cinema.service.PaymentWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentWebhookServiceImpl implements PaymentWebhookService {

    private final PaymentWebhookRepository repository;
    private final PaymentWebhookMapper paymentWebhookMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentWebhookResponse> findAll() {
        return paymentWebhookMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentWebhookResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(paymentWebhookMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "paymentwebhooks", key = "#id")
    public PaymentWebhookResponse findById(UUID id) {
        return repository.findById(id)
                .map(paymentWebhookMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", allEntries = true)
    public PaymentWebhookResponse create(PaymentWebhookCreateRequest request) {
        PaymentWebhook entity = paymentWebhookMapper.toEntity(request);
        return paymentWebhookMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", allEntries = true)
    public PaymentWebhookResponse update(UUID id, PaymentWebhookUpdateRequest request) {
        PaymentWebhook entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
        paymentWebhookMapper.updateEntityFromRequest(request, entity);
        return paymentWebhookMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymentwebhooks", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
