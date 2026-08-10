package com.example.cinema.service.impl;

import com.example.cinema.entity.BookingStatusHistory;
import com.example.cinema.repository.BookingStatusHistoryRepository;
import com.example.cinema.service.BookingStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingStatusHistoryServiceImpl implements BookingStatusHistoryService {

    private final BookingStatusHistoryRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingStatusHistory> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BookingStatusHistory> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public BookingStatusHistory save(BookingStatusHistory entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
