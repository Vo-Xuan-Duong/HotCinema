package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Ticket;
import com.example.cinema.dto.ticket.TicketResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface TicketService {
    List<TicketResponse> findAll();
    PageResponse<TicketResponse> findPage(Pageable pageable);
    Optional<Ticket> findById(UUID id);
    Ticket save(Ticket entity);
    void deleteById(UUID id);
}
