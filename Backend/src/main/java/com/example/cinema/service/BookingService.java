package com.example.cinema.service;

import com.example.cinema.entity.Booking;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingService {
    Page<Booking> findAll(Pageable pageable);
    Optional<Booking> findById(UUID id);
    Booking save(Booking entity);
    void deleteById(UUID id);
}
