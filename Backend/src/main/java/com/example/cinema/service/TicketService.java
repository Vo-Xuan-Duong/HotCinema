package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface TicketService {
    List<TicketResponse> findAll();
    PageResponse<TicketResponse> findPage(Pageable pageable);
    TicketResponse findById(UUID id);
    TicketResponse create(TicketCreateRequest request);
    TicketResponse update(UUID id, TicketUpdateRequest request);
    void deleteById(UUID id);
}
