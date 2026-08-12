package com.example.cinema.service;

import com.example.cinema.entity.ShowtimePrice;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimePriceService {
    Page<ShowtimePrice> findAll(Pageable pageable);
    Optional<ShowtimePrice> findById(UUID id);
    ShowtimePrice save(ShowtimePrice entity);
    void deleteById(UUID id);
}
