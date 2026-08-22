package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.TicketScan;
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
import java.util.Optional;
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
    public Optional<TicketScan> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", key = "#result.id")
    public TicketScan save(TicketScan entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "ticketscans", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
