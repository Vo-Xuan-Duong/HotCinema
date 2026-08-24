package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.entity.enums.PaymentStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface PaymentService {
    List<PaymentResponse> findAll();
    PageResponse<PaymentResponse> findPage(Pageable pageable);
    PageResponse<PaymentResponse> findByStatus(PaymentStatus status, Pageable pageable);
    PaymentResponse findById(UUID id);
    PaymentResponse findByIdForUser(UUID id, UUID userId);
    List<PaymentResponse> findByBookingId(UUID bookingId);
    List<PaymentResponse> findByBookingIdForUser(UUID bookingId, UUID userId);
    PaymentResponse findByTransactionId(String transactionId);
    PaymentResponse create(PaymentCreateRequest request);
    PaymentResponse createForUser(PaymentCreateRequest request, UUID userId);
    PaymentResponse update(UUID id, PaymentUpdateRequest request);
    PaymentResponse updateStatus(UUID id, PaymentStatus status);
    PaymentResponse updateTransactionId(UUID id, String transactionId);
    void deleteById(UUID id);
}
