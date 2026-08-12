package com.example.cinema.service.impl;

import com.example.cinema.entity.BookingSeat;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.service.BookingSeatService;
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
public class BookingSeatServiceImpl implements BookingSeatService {

    private final BookingSeatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<BookingSeat> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookingseats", key = "#id")
    public Optional<BookingSeat> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingseats", key = "#result.id")
    public BookingSeat save(BookingSeat entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingseats", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
