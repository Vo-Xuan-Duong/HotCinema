package com.example.cinema.service.impl;

import com.example.cinema.entity.BookingItem;
import com.example.cinema.repository.BookingItemRepository;
import com.example.cinema.service.BookingItemService;
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
public class BookingItemServiceImpl implements BookingItemService {

    private final BookingItemRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<BookingItem> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookingitems", key = "#id")
    public Optional<BookingItem> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingitems", key = "#result.id")
    public BookingItem save(BookingItem entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingitems", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
