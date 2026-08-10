package com.example.cinema.service;

import com.example.cinema.entity.Seat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeatService {
    List<Seat> findAll();
    Optional<Seat> findById(UUID id);
    Seat save(Seat entity);
    void deleteById(UUID id);
}
