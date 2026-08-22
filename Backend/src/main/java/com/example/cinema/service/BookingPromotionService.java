package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.bookingpromotion.BookingPromotionCreateRequest;
import com.example.cinema.dto.bookingpromotion.BookingPromotionUpdateRequest;
import com.example.cinema.dto.bookingpromotion.BookingPromotionResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface BookingPromotionService {
    List<BookingPromotionResponse> findAll();
    PageResponse<BookingPromotionResponse> findPage(Pageable pageable);
    BookingPromotionResponse findById(UUID id);
    BookingPromotionResponse create(BookingPromotionCreateRequest request);
    BookingPromotionResponse update(UUID id, BookingPromotionUpdateRequest request);
    void deleteById(UUID id);
}
