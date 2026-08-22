package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryCreateRequest;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryUpdateRequest;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface BookingStatusHistoryService {
    List<BookingStatusHistoryResponse> findAll();
    PageResponse<BookingStatusHistoryResponse> findPage(Pageable pageable);
    BookingStatusHistoryResponse findById(UUID id);
    BookingStatusHistoryResponse create(BookingStatusHistoryCreateRequest request);
    BookingStatusHistoryResponse update(UUID id, BookingStatusHistoryUpdateRequest request);
    void deleteById(UUID id);
}
