package com.example.cinema.service.impl;

import com.example.cinema.entity.Booking;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.service.BookingService;
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
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Booking> findAll(Pageable pageable) {
        return repository.findAllByIsActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookings", key = "#id")
    public Optional<Booking> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", key = "#result.id")
    public Booking save(Booking entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
