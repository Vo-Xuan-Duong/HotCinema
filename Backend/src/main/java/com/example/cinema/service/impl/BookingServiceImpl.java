package com.example.cinema.service.impl;

import com.example.cinema.entity.Booking;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Booking> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Booking> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Booking save(Booking entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
