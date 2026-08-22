package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.TicketScan;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface TicketScanService {
    List<TicketScanResponse> findAll();
    PageResponse<TicketScanResponse> findPage(Pageable pageable);
    Optional<TicketScan> findById(UUID id);
    TicketScan save(TicketScan entity);
    void deleteById(UUID id);
}
