package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.paymentwebhook.MomoIpnResponse;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookCreateRequest;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookResponse;
import com.example.cinema.dto.paymentwebhook.PaymentWebhookUpdateRequest;
import com.example.cinema.service.PaymentWebhookService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/paymentwebhooks")
public class PaymentWebhookController {

    private final PaymentWebhookService paymentWebhookService;

    public PaymentWebhookController(PaymentWebhookService paymentWebhookService) {
        this.paymentWebhookService = paymentWebhookService;
    }

    @PostMapping(
            value = "/momo",
            consumes = MediaType.APPLICATION_JSON_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<MomoIpnResponse> processMomo(@RequestBody String payload) {
        return ResponseEntity.ok(paymentWebhookService.processMomoIpn(payload));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentWebhookResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.findAll()));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PaymentWebhookResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> create(
            @Valid @RequestBody PaymentWebhookCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentWebhookResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentWebhookUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentWebhookService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentWebhookService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
