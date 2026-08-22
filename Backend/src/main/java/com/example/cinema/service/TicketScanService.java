package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface TicketScanService {
    List<TicketScanResponse> findAll();
    PageResponse<TicketScanResponse> findPage(Pageable pageable);
    TicketScanResponse findById(UUID id);
    TicketScanResponse create(TicketScanCreateRequest request);
    TicketScanResponse update(UUID id, TicketScanUpdateRequest request);
    void deleteById(UUID id);
}
