package com.example.cinema.controller;

import com.example.cinema.entity.Ticket;
import com.example.cinema.service.TicketService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.TicketMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final TicketMapper ticketMapper;

    public TicketController(TicketService ticketService, TicketMapper ticketMapper) {
        this.ticketService = ticketService;
        this.ticketMapper = ticketMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TicketResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Ticket> pageResult = ticketService.findAll(pageable);
        Page<TicketResponse> responsePage = pageResult.map(ticketMapper::toResponse);
        PageResponse<TicketResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> getById(@PathVariable UUID id) {
        TicketResponse res = ticketService.findById(id)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketResponse>> create(@Valid @RequestBody TicketCreateRequest request) {
        Ticket entity = ticketMapper.toEntity(request);
        Ticket saved = ticketService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(ticketMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponse>> update(@PathVariable UUID id, @Valid @RequestBody TicketUpdateRequest request) {
        Ticket existing = ticketService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id.toString()));
        ticketMapper.updateEntityFromRequest(request, existing);
        Ticket saved = ticketService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(ticketMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id.toString()));
        ticketService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}