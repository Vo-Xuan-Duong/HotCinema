package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.PaymentTransaction;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionResponse;
import com.example.cinema.mapper.PaymentTransactionMapper;
import com.example.cinema.repository.PaymentTransactionRepository;
import com.example.cinema.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final PaymentTransactionRepository repository;
    private final PaymentTransactionMapper paymentTransactionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransactionResponse> findAll() {
        return paymentTransactionMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentTransactionResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(paymentTransactionMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "paymenttransactions", key = "#id")
    public Optional<PaymentTransaction> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymenttransactions", key = "#result.id")
    public PaymentTransaction save(PaymentTransaction entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "paymenttransactions", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
