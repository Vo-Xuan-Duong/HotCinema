package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.booking.BookingCheckoutRequest;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.entity.enums.BookingStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BookingService {
    List<BookingResponse> findAll();
    List<BookingResponse> findAllByUser(UUID userId);
    PageResponse<BookingResponse> findPage(Pageable pageable);
    PageResponse<BookingResponse> findPageByUser(UUID userId, Pageable pageable);
    BookingResponse findById(UUID id);
    BookingResponse findByIdForUser(UUID id, UUID userId);
    BookingResponse findByCode(String bookingCode);
    BookingResponse findByCodeForUser(String bookingCode, UUID userId);
    BookingResponse checkout(UUID userId, BookingCheckoutRequest request);
    BookingResponse create(BookingCreateRequest request);
    BookingResponse createForUser(BookingCreateRequest request, UUID userId);
    BookingResponse update(UUID id, BookingUpdateRequest request);
    BookingResponse updateStatus(UUID id, BookingStatus status);
    void deleteById(UUID id);
}
