package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.paymenttransaction.PaymentTransactionCreateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionUpdateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface PaymentTransactionService {
    List<PaymentTransactionResponse> findAll();
    PageResponse<PaymentTransactionResponse> findPage(Pageable pageable);
    PaymentTransactionResponse findById(UUID id);
    PaymentTransactionResponse create(PaymentTransactionCreateRequest request);
    PaymentTransactionResponse update(UUID id, PaymentTransactionUpdateRequest request);
    void deleteById(UUID id);
}
