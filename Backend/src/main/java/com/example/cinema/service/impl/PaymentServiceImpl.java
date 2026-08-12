package com.example.cinema.service.impl;

import com.example.cinema.entity.Payment;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.service.PaymentService;
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
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Payment> findAll(Pageable pageable) {
        return repository.findAllByIsDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "#id")
    public Optional<Payment> findById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", key = "#result.id")
    public Payment save(Payment entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsDeletedFalse(id).ifPresent(entity -> {
            entity.setDeleted(true);
            repository.save(entity);
        });
    }
}
