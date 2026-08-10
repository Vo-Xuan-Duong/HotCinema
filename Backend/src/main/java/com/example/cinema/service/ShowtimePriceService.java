package com.example.cinema.service;

import com.example.cinema.entity.ShowtimePrice;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimePriceService {
    List<ShowtimePrice> findAll();
    Optional<ShowtimePrice> findById(UUID id);
    ShowtimePrice save(ShowtimePrice entity);
    void deleteById(UUID id);
}
