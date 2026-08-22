package com.example.cinema.controller;

import com.example.cinema.service.PaymentWebhookService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paymentwebhooks")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;

    public PaymentWebhookController(PaymentWebhookService paymentWebhookService) {
        this.paymentWebhookService = paymentWebhookService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentWebhookResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<PaymentWebhookResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> create(@Valid @RequestBody PaymentWebhookCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> update(@PathVariable UUID id, @Valid @RequestBody PaymentWebhookUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentWebhookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
