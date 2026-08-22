package com.example.cinema.controller;

import com.example.cinema.service.TicketScanService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ticketscans")
public class TicketScanController {

    private final TicketScanService ticketScanService;

    public TicketScanController(TicketScanService ticketScanService) {
        this.ticketScanService = ticketScanService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketScanResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<TicketScanResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketScanResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketScanResponse>> create(@Valid @RequestBody TicketScanCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketScanResponse>> update(@PathVariable UUID id, @Valid @RequestBody TicketScanUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketScanService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketScanService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
