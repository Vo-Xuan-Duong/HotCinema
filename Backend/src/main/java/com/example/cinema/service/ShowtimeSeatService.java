package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ShowtimeSeatService {
    List<ShowtimeSeatResponse> findAll();
    PageResponse<ShowtimeSeatResponse> findPage(Pageable pageable);
    Optional<ShowtimeSeat> findById(UUID id);
    ShowtimeSeat save(ShowtimeSeat entity);
    void deleteById(UUID id);
}
