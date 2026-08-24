package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketResponse;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface TicketService {
    List<TicketResponse> findAll();
    PageResponse<TicketResponse> findPage(Pageable pageable);
    TicketResponse findById(UUID id);
    TicketResponse findByIdForUser(UUID id, UUID userId);
    List<TicketResponse> findByBookingId(UUID bookingId);
    List<TicketResponse> findByBookingIdForUser(UUID bookingId, UUID userId);
    TicketResponse create(TicketCreateRequest request);
    TicketResponse update(UUID id, TicketUpdateRequest request);
    void deleteById(UUID id);
}
