package com.example.cinema.controller;

import com.example.cinema.service.TicketService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(ticketService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> create(@Valid @RequestBody TicketCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> update(@PathVariable UUID id, @Valid @RequestBody TicketUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(ticketService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
