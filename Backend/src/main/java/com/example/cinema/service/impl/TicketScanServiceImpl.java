package com.example.cinema.service.impl;

import com.example.cinema.entity.TicketScan;
import com.example.cinema.repository.TicketScanRepository;
import com.example.cinema.service.TicketScanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketScanServiceImpl implements TicketScanService {

    private final TicketScanRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<TicketScan> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<TicketScan> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public TicketScan save(TicketScan entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
