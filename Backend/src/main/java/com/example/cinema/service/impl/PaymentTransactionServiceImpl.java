package com.example.cinema.service.impl;

import com.example.cinema.entity.PaymentTransaction;
import com.example.cinema.repository.PaymentTransactionRepository;
import com.example.cinema.service.PaymentTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final PaymentTransactionRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentTransaction> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PaymentTransaction> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public PaymentTransaction save(PaymentTransaction entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
