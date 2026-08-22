package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.BookingPromotion;
import com.example.cinema.dto.bookingpromotion.BookingPromotionResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingPromotionService {
    List<BookingPromotionResponse> findAll();
    PageResponse<BookingPromotionResponse> findPage(Pageable pageable);
    Optional<BookingPromotion> findById(UUID id);
    BookingPromotion save(BookingPromotion entity);
    void deleteById(UUID id);
}
