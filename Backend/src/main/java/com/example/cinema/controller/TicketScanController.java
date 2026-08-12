package com.example.cinema.controller;

import com.example.cinema.entity.TicketScan;
import com.example.cinema.service.TicketScanService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.TicketScanMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ticketscans")
public class TicketScanController {

    private final TicketScanService ticketScanService;
    private final TicketScanMapper ticketScanMapper;

    public TicketScanController(TicketScanService ticketScanService, TicketScanMapper ticketScanMapper) {
        this.ticketScanService = ticketScanService;
        this.ticketScanMapper = ticketScanMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<TicketScanResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<TicketScan> pageResult = ticketScanService.findAll(pageable);
        Page<TicketScanResponse> responsePage = pageResult.map(ticketScanMapper::toResponse);
        PageResponse<TicketScanResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketScanResponse>> getById(@PathVariable UUID id) {
        TicketScanResponse res = ticketScanService.findById(id)
                .map(ticketScanMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketScanResponse>> create(@Valid @RequestBody TicketScanCreateRequest request) {
        TicketScan entity = ticketScanMapper.toEntity(request);
        TicketScan saved = ticketScanService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(ticketScanMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketScanResponse>> update(@PathVariable UUID id, @Valid @RequestBody TicketScanUpdateRequest request) {
        TicketScan existing = ticketScanService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
        ticketScanMapper.updateEntityFromRequest(request, existing);
        TicketScan saved = ticketScanService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(ticketScanMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        ticketScanService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
        ticketScanService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}