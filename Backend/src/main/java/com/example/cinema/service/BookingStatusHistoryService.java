package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.BookingStatusHistory;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingStatusHistoryService {
    List<BookingStatusHistoryResponse> findAll();
    PageResponse<BookingStatusHistoryResponse> findPage(Pageable pageable);
    Optional<BookingStatusHistory> findById(UUID id);
    BookingStatusHistory save(BookingStatusHistory entity);
    void deleteById(UUID id);
}
