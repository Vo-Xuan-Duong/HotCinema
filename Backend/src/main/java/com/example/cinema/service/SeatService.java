package com.example.cinema.service;

import com.example.cinema.entity.Seat;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface SeatService {
    Page<Seat> findAll(Pageable pageable);
    Optional<Seat> findById(UUID id);
    Seat save(Seat entity);
    void deleteById(UUID id);
}
