package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ShowtimeSeatService {
    List<ShowtimeSeatResponse> findAll();
    PageResponse<ShowtimeSeatResponse> findPage(Pageable pageable);
    ShowtimeSeatResponse findById(UUID id);
    ShowtimeSeatResponse create(ShowtimeSeatCreateRequest request);
    ShowtimeSeatResponse update(UUID id, ShowtimeSeatUpdateRequest request);
    void deleteById(UUID id);
}
