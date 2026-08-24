package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentInitiateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.entity.enums.PaymentStatus;
import com.example.cinema.service.PaymentService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.findAll()));
    }

    @GetMapping("/all-no-page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllNoPagination() {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.findAll()));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(paymentService.findPage(pageable)));
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<PaymentResponse>>> getByStatus(
            @PathVariable PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(paymentService.findByStatus(status, pageable)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByBookingId(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        List<PaymentResponse> payments = isAdmin(authentication)
                ? paymentService.findByBookingId(bookingId)
                : paymentService.findByBookingIdForUser(bookingId, currentUserId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(payments));
    }

    @GetMapping("/transaction/{transactionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getByTransactionId(@PathVariable String transactionId) {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.findByTransactionId(transactionId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        PaymentResponse payment = isAdmin(authentication)
                ? paymentService.findById(id)
                : paymentService.findByIdForUser(id, currentUserId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(payment));
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentResponse>> initiate(
            @Valid @RequestBody PaymentInitiateRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.initiate(request, currentUserId(jwt))));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> create(@Valid @RequestBody PaymentCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody PaymentStatusUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.updateStatus(id, request.status())));
    }

    @PatchMapping("/{id}/transaction-id")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> updateTransactionId(
            @PathVariable UUID id,
            @Valid @RequestBody TransactionIdUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(paymentService.updateTransactionId(id, request.transactionId())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        paymentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public record PaymentStatusUpdateRequest(@NotNull PaymentStatus status) {}

    public record TransactionIdUpdateRequest(@NotBlank String transactionId) {}
}
