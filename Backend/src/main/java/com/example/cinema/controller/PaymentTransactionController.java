package com.example.cinema.controller;

import com.example.cinema.entity.PaymentTransaction;
import com.example.cinema.service.PaymentTransactionService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.PaymentTransactionMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionCreateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionUpdateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paymenttransactions")
public class PaymentTransactionController {

    private final PaymentTransactionService paymentTransactionService;
    private final PaymentTransactionMapper paymentTransactionMapper;

    public PaymentTransactionController(PaymentTransactionService paymentTransactionService, PaymentTransactionMapper paymentTransactionMapper) {
        this.paymentTransactionService = paymentTransactionService;
        this.paymentTransactionMapper = paymentTransactionMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentTransactionResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentTransaction> pageResult = paymentTransactionService.findAll(pageable);
        Page<PaymentTransactionResponse> responsePage = pageResult.map(paymentTransactionMapper::toResponse);
        PageResponse<PaymentTransactionResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getById(@PathVariable UUID id) {
        PaymentTransactionResponse res = paymentTransactionService.findById(id)
                .map(paymentTransactionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTransaction", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> create(@Valid @RequestBody PaymentTransactionCreateRequest request) {
        PaymentTransaction entity = paymentTransactionMapper.toEntity(request);
        PaymentTransaction saved = paymentTransactionService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> update(@PathVariable UUID id, @Valid @RequestBody PaymentTransactionUpdateRequest request) {
        PaymentTransaction existing = paymentTransactionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTransaction", id.toString()));
        paymentTransactionMapper.updateEntityFromRequest(request, existing);
        PaymentTransaction saved = paymentTransactionService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentTransactionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentTransaction", id.toString()));
        paymentTransactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}