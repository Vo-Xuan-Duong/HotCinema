package com.example.cinema.service;

import com.example.cinema.entity.ShowtimeSeat;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimeSeatService {
    Page<ShowtimeSeat> findAll(Pageable pageable);
    Optional<ShowtimeSeat> findById(UUID id);
    ShowtimeSeat save(ShowtimeSeat entity);
    void deleteById(UUID id);
}
