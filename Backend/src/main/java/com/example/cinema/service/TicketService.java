package com.example.cinema.service;

import com.example.cinema.entity.Ticket;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketService {
    List<Ticket> findAll();
    Optional<Ticket> findById(UUID id);
    Ticket save(Ticket entity);
    void deleteById(UUID id);
}
