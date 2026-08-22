package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface PaymentService {
    List<PaymentResponse> findAll();
    PageResponse<PaymentResponse> findPage(Pageable pageable);
    PaymentResponse findById(UUID id);
    PaymentResponse create(PaymentCreateRequest request);
    PaymentResponse update(UUID id, PaymentUpdateRequest request);
    void deleteById(UUID id);
}
