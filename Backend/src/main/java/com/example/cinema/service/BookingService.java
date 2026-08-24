package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BookingService {
    List<BookingResponse> findAll();
    PageResponse<BookingResponse> findPage(Pageable pageable);
    PageResponse<BookingResponse> findPageByUser(UUID userId, Pageable pageable);
    BookingResponse findById(UUID id);
    BookingResponse findByIdForUser(UUID id, UUID userId);
    BookingResponse findByCode(String bookingCode);
    BookingResponse findByCodeForUser(String bookingCode, UUID userId);
    BookingResponse create(BookingCreateRequest request);
    BookingResponse createForUser(BookingCreateRequest request, UUID userId);
    BookingResponse update(UUID id, BookingUpdateRequest request);
    void deleteById(UUID id);
}
