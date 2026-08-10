package com.example.cinema.service.impl;

import com.example.cinema.entity.BookingItem;
import com.example.cinema.repository.BookingItemRepository;
import com.example.cinema.service.BookingItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingItemServiceImpl implements BookingItemService {

    private final BookingItemRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingItem> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BookingItem> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public BookingItem save(BookingItem entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
