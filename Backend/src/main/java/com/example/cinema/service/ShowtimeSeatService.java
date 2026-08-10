package com.example.cinema.service;

import com.example.cinema.entity.ShowtimeSeat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimeSeatService {
    List<ShowtimeSeat> findAll();
    Optional<ShowtimeSeat> findById(UUID id);
    ShowtimeSeat save(ShowtimeSeat entity);
    void deleteById(UUID id);
}
