package com.example.cinema.service.impl;

import com.example.cinema.entity.Ticket;
import com.example.cinema.repository.TicketRepository;
import com.example.cinema.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Ticket> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Ticket> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Ticket save(Ticket entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
