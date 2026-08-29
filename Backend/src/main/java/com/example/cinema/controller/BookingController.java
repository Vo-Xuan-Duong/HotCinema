package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.booking.BookingCheckoutRequest;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.service.BookingCancellationService;
import com.example.cinema.service.BookingRefundService;
import com.example.cinema.service.BookingService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingCancellationService bookingCancellationService;
    private final BookingRefundService bookingRefundService;

    public BookingController(
            BookingService bookingService,
            BookingCancellationService bookingCancellationService,
            BookingRefundService bookingRefundService) {
        this.bookingService = bookingService;
        this.bookingCancellationService = bookingCancellationService;
        this.bookingRefundService = bookingRefundService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(bookingService.findAll()));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingService.findPage(pageable)));
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingService.findPageByUser(currentUserId(jwt), pageable)));
    }

    @GetMapping("/my-bookings/history")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookingHistory(
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(bookingService.findAllByUser(currentUserId(jwt))));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getUserBookings(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingService.findPageByUser(userId, pageable)));
    }

    @GetMapping("/history/user/{userId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getUserBookingHistory(
            @PathVariable UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingService.findPageByUser(userId, pageable)));
    }

    @GetMapping("/code/{bookingCode}")
    public ResponseEntity<ApiResponse<BookingResponse>> getByCode(
            @PathVariable String bookingCode,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        BookingResponse booking = isAdmin(authentication)
                ? bookingService.findByCode(bookingCode)
                : bookingService.findByCodeForUser(bookingCode, currentUserId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(booking));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        BookingResponse booking = isAdmin(authentication)
                ? bookingService.findById(id)
                : bookingService.findByIdForUser(id, currentUserId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(booking));
    }

    @PostMapping("/checkout")
    public ResponseEntity<ApiResponse<BookingResponse>> checkout(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody BookingCheckoutRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingService.checkout(currentUserId(jwt), request)));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelMyBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(
                bookingCancellationService.cancelForUser(id, currentUserId(jwt))
        ));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<BookingResponse>> refundMyBooking(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        return ResponseEntity.ok(new ApiResponse<>(
                bookingRefundService.refundForUser(id, currentUserId(jwt))
        ));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody BookingUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingService.update(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponse>> updateStatus(
            @PathVariable UUID id,
            @Valid @RequestBody BookingStatusUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingService.updateStatus(id, request.status())));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }

    public record BookingStatusUpdateRequest(@NotNull BookingStatus status) {}
}
