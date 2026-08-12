package com.example.cinema.controller;

import com.example.cinema.entity.Payment;
import com.example.cinema.service.PaymentService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.PaymentMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final PaymentMapper paymentMapper;

    public PaymentController(PaymentService paymentService, PaymentMapper paymentMapper) {
        this.paymentService = paymentService;
        this.paymentMapper = paymentMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> pageResult = paymentService.findAll(pageable);
        Page<PaymentResponse> responsePage = pageResult.map(paymentMapper::toResponse);
        PageResponse<PaymentResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable UUID id) {
        PaymentResponse res = paymentService.findById(id)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentResponse>> create(@Valid @RequestBody PaymentCreateRequest request) {
        Payment entity = paymentMapper.toEntity(request);
        Payment saved = paymentService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(paymentMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> update(@PathVariable UUID id, @Valid @RequestBody PaymentUpdateRequest request) {
        Payment existing = paymentService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
        paymentMapper.updateEntityFromRequest(request, existing);
        Payment saved = paymentService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(paymentMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
        paymentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}