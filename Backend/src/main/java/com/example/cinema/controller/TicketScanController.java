package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.ticketscan.TicketScanCommandRequest;
import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.service.TicketScanService;
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
@RequestMapping("/api/v1/ticketscans")
public class TicketScanController {

    private final TicketScanService ticketScanService;

    public TicketScanController(TicketScanService ticketScanService) {
        this.ticketScanService = ticketScanService;
    }

    @PostMapping("/scan")
    public ResponseEntity<ApiResponse<TicketScanResponse>> scan(
            @Valid @RequestBody TicketScanCommandRequest request,
            @AuthenticationPrincipal Jwt jwt,
            Authentication authentication) {
        TicketScanResponse response = ticketScanService.scan(
                request.getQrToken(),
                request.getCinemaId(),
                currentUserId(jwt),
                request.getDeviceInfo(),
                isAdmin(authentication)
        );
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<TicketScanResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.findAll()));
    }

    @GetMapping("/page")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PageResponse<TicketScanResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketScanResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.findById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketScanResponse>> create(@Valid @RequestBody TicketScanCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TicketScanResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody TicketScanUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketScanService.deleteById(id);
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
