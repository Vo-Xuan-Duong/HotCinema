package com.example.cinema.service.impl;

import com.example.cinema.entity.PaymentTransaction;
import com.example.cinema.repository.PaymentTransactionRepository;
import com.example.cinema.service.PaymentTransactionService;
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
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final PaymentTransactionRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<PaymentTransaction> findAll(Pageable pageable) {
        return repository.findAll(pageable);
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
