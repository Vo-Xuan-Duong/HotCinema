package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.bookingitem.BookingItemCreateRequest;
import com.example.cinema.dto.bookingitem.BookingItemResponse;
import com.example.cinema.dto.bookingitem.BookingItemUpdateRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface BookingItemService {
    List<BookingItemResponse> findAll();
    List<BookingItemResponse> findByBooking(UUID bookingId);
    PageResponse<BookingItemResponse> findPage(Pageable pageable);
    BookingItemResponse findById(UUID id);
    BookingItemResponse create(BookingItemCreateRequest request);
    BookingItemResponse update(UUID id, BookingItemUpdateRequest request);
    void deleteById(UUID id);
}
