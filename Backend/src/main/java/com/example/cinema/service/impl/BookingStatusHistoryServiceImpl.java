package com.example.cinema.service.impl;

import com.example.cinema.entity.BookingStatusHistory;
import com.example.cinema.repository.BookingStatusHistoryRepository;
import com.example.cinema.service.BookingStatusHistoryService;
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
public class BookingStatusHistoryServiceImpl implements BookingStatusHistoryService {

    private final BookingStatusHistoryRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<BookingStatusHistory> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookingstatushistorys", key = "#id")
    public Optional<BookingStatusHistory> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingstatushistorys", key = "#result.id")
    public BookingStatusHistory save(BookingStatusHistory entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingstatushistorys", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
