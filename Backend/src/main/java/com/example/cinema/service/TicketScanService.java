package com.example.cinema.service;

import com.example.cinema.entity.TicketScan;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketScanService {
    List<TicketScan> findAll();
    Optional<TicketScan> findById(UUID id);
    TicketScan save(TicketScan entity);
    void deleteById(UUID id);
}
