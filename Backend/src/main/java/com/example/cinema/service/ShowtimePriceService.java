package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.showtimeprice.ShowtimePriceCreateRequest;
import com.example.cinema.dto.showtimeprice.ShowtimePriceUpdateRequest;
import com.example.cinema.dto.showtimeprice.ShowtimePriceResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ShowtimePriceService {
    List<ShowtimePriceResponse> findAll();
    PageResponse<ShowtimePriceResponse> findPage(Pageable pageable);
    ShowtimePriceResponse findById(UUID id);
    ShowtimePriceResponse create(ShowtimePriceCreateRequest request);
    ShowtimePriceResponse update(UUID id, ShowtimePriceUpdateRequest request);
    void deleteById(UUID id);
}
