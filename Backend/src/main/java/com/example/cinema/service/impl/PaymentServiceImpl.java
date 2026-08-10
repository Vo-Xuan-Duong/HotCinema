package com.example.cinema.service.impl;

import com.example.cinema.entity.Payment;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Payment> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Payment> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Payment save(Payment entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
