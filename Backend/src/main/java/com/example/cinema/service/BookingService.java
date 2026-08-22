package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Booking;
import com.example.cinema.dto.booking.BookingResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingService {
    List<BookingResponse> findAll();
    PageResponse<BookingResponse> findPage(Pageable pageable);
    Optional<Booking> findById(UUID id);
    Booking save(Booking entity);
    void deleteById(UUID id);
}
