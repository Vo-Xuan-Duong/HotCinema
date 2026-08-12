package com.example.cinema.controller;

import com.example.cinema.entity.PaymentWebhook;
import com.example.cinema.service.PaymentWebhookService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.PaymentWebhookMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paymentwebhooks")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;
    private final PaymentWebhookMapper paymentWebhookMapper;

    public PaymentWebhookController(PaymentWebhookService paymentWebhookService, PaymentWebhookMapper paymentWebhookMapper) {
        this.paymentWebhookService = paymentWebhookService;
        this.paymentWebhookMapper = paymentWebhookMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<PaymentWebhookResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PaymentWebhook> pageResult = paymentWebhookService.findAll(pageable);
        Page<PaymentWebhookResponse> responsePage = pageResult.map(paymentWebhookMapper::toResponse);
        PageResponse<PaymentWebhookResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> getById(@PathVariable UUID id) {
        PaymentWebhookResponse res = paymentWebhookService.findById(id)
                .map(paymentWebhookMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> create(@Valid @RequestBody PaymentWebhookCreateRequest request) {
        PaymentWebhook entity = paymentWebhookMapper.toEntity(request);
        PaymentWebhook saved = paymentWebhookService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> update(@PathVariable UUID id, @Valid @RequestBody PaymentWebhookUpdateRequest request) {
        PaymentWebhook existing = paymentWebhookService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
        paymentWebhookMapper.updateEntityFromRequest(request, existing);
        PaymentWebhook saved = paymentWebhookService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentWebhookService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentWebhook", id.toString()));
        paymentWebhookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}