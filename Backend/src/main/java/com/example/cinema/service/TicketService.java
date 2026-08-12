package com.example.cinema.service;

import com.example.cinema.entity.Ticket;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface TicketService {
    Page<Ticket> findAll(Pageable pageable);
    Optional<Ticket> findById(UUID id);
    Ticket save(Ticket entity);
    void deleteById(UUID id);
}
