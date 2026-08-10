package com.example.cinema.service;

import com.example.cinema.entity.BookingPromotion;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingPromotionService {
    List<BookingPromotion> findAll();
    Optional<BookingPromotion> findById(UUID id);
    BookingPromotion save(BookingPromotion entity);
    void deleteById(UUID id);
}
