package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.PaymentTransaction;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionService {
    List<PaymentTransactionResponse> findAll();
    PageResponse<PaymentTransactionResponse> findPage(Pageable pageable);
    Optional<PaymentTransaction> findById(UUID id);
    PaymentTransaction save(PaymentTransaction entity);
    void deleteById(UUID id);
}
