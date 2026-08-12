package com.example.cinema.service;

import com.example.cinema.entity.SeatType;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface SeatTypeService {
    Page<SeatType> findAll(Pageable pageable);
    Optional<SeatType> findById(UUID id);
    SeatType save(SeatType entity);
    void deleteById(UUID id);
}
