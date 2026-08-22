package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.TicketScan;
import com.example.cinema.dto.ticketscan.TicketScanCreateRequest;
import com.example.cinema.dto.ticketscan.TicketScanUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.ticketscan.TicketScanResponse;
import com.example.cinema.mapper.TicketScanMapper;
import com.example.cinema.repository.TicketScanRepository;
import com.example.cinema.service.TicketScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketScanServiceImpl implements TicketScanService {

    private final TicketScanRepository repository;
    private final TicketScanMapper ticketScanMapper;

    @Override
    @Transactional(readOnly = true)
    public List<TicketScanResponse> findAll() {
        return ticketScanMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TicketScanResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(ticketScanMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "ticketscans", key = "#id")
    public TicketScanResponse findById(UUID id) {
        return repository.findById(id)
                .map(ticketScanMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", allEntries = true)
    public TicketScanResponse create(TicketScanCreateRequest request) {
        TicketScan entity = ticketScanMapper.toEntity(request);
        return ticketScanMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", allEntries = true)
    public TicketScanResponse update(UUID id, TicketScanUpdateRequest request) {
        TicketScan entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("TicketScan", id.toString()));
        ticketScanMapper.updateEntityFromRequest(request, entity);
        return ticketScanMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
