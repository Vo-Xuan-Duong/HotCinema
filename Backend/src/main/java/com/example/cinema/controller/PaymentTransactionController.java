package com.example.cinema.controller;

import com.example.cinema.service.PaymentTransactionService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionCreateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionUpdateRequest;
import com.example.cinema.dto.paymenttransaction.PaymentTransactionResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paymenttransactions")
public class PaymentTransactionController {

    private final PaymentTransactionService paymentTransactionService;

    public PaymentTransactionController(PaymentTransactionService paymentTransactionService) {
        this.paymentTransactionService = paymentTransactionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentTransactionResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<PaymentTransactionResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> create(@Valid @RequestBody PaymentTransactionCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentTransactionResponse>> update(@PathVariable UUID id, @Valid @RequestBody PaymentTransactionUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentTransactionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentTransactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
