package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.service.TicketService;
import jakarta.validation.Valid;
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
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.findAll()));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(ticketService.findPage(pageable)));
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getByBooking(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        List<TicketResponse> tickets = isAdmin(authentication)
                ? ticketService.findByBookingId(bookingId)
                : ticketService.findByBookingIdForUser(bookingId, currentUserId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(tickets));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getById(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        TicketResponse ticket = isAdmin(authentication)
                ? ticketService.findById(id)
                : ticketService.findByIdForUser(id, currentUserId(jwt));
        return ResponseEntity.ok(new ApiResponse<>(ticket));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> create(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId(Jwt jwt) {
        return UUID.fromString(Objects.requireNonNull(jwt.getSubject()));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
