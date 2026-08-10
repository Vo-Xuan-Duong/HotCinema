package com.example.cinema.service;

import com.example.cinema.entity.Booking;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingService {
    List<Booking> findAll();
    Optional<Booking> findById(UUID id);
    Booking save(Booking entity);
    void deleteById(UUID id);
}
