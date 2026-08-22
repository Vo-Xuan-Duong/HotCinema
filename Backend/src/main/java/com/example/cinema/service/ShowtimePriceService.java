package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.ShowtimePrice;
import com.example.cinema.dto.showtimeprice.ShowtimePriceResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimePriceService {
    List<ShowtimePriceResponse> findAll();
    PageResponse<ShowtimePriceResponse> findPage(Pageable pageable);
    Optional<ShowtimePrice> findById(UUID id);
    ShowtimePrice save(ShowtimePrice entity);
    void deleteById(UUID id);
}
