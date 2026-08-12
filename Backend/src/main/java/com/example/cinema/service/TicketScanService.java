package com.example.cinema.service;

import com.example.cinema.entity.TicketScan;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface TicketScanService {
    Page<TicketScan> findAll(Pageable pageable);
    Optional<TicketScan> findById(UUID id);
    TicketScan save(TicketScan entity);
    void deleteById(UUID id);
}
