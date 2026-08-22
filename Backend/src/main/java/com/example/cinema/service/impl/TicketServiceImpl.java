package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Ticket;
import com.example.cinema.dto.ticket.TicketCreateRequest;
import com.example.cinema.dto.ticket.TicketUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.ticket.TicketResponse;
import com.example.cinema.mapper.TicketMapper;
import com.example.cinema.repository.TicketRepository;
import com.example.cinema.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository repository;
    private final TicketMapper ticketMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TicketResponse> findAll() {
        return ticketMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(ticketMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tickets", key = "#id")
    public TicketResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(ticketMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "tickets", allEntries = true)
    public TicketResponse create(TicketCreateRequest request) {
        Ticket entity = ticketMapper.toEntity(request);
        return ticketMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "tickets", allEntries = true)
    public TicketResponse update(UUID id, TicketUpdateRequest request) {
        Ticket entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket", id.toString()));
        ticketMapper.updateEntityFromRequest(request, entity);
        return ticketMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "tickets", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
