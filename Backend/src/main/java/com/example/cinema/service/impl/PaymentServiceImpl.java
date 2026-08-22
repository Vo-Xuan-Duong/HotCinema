package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Payment;
import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.payment.PaymentResponse;
import com.example.cinema.mapper.PaymentMapper;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.service.PaymentService;
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
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(paymentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "#id")
    public PaymentResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse create(PaymentCreateRequest request) {
        Payment entity = paymentMapper.toEntity(request);
        return paymentMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse update(UUID id, PaymentUpdateRequest request) {
        Payment entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
        paymentMapper.updateEntityFromRequest(request, entity);
        return paymentMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
