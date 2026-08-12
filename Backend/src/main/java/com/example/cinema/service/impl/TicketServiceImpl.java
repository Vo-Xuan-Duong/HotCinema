package com.example.cinema.service.impl;

import com.example.cinema.entity.Ticket;
import com.example.cinema.repository.TicketRepository;
import com.example.cinema.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketServiceImpl implements TicketService {

    private final TicketRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Ticket> findAll(Pageable pageable) {
        return repository.findAllByIsDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "tickets", key = "#id")
    public Optional<Ticket> findById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "tickets", key = "#result.id")
    public Ticket save(Ticket entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "tickets", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsDeletedFalse(id).ifPresent(entity -> {
            entity.setDeleted(true);
            repository.save(entity);
        });
    }
}
