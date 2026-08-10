package com.example.cinema.service;

import com.example.cinema.entity.SeatType;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SeatTypeService {
    List<SeatType> findAll();
    Optional<SeatType> findById(UUID id);
    SeatType save(SeatType entity);
    void deleteById(UUID id);
}
