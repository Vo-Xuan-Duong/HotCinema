package com.example.cinema.service;

import com.example.cinema.entity.BookingPromotion;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingPromotionService {
    Page<BookingPromotion> findAll(Pageable pageable);
    Optional<BookingPromotion> findById(UUID id);
    BookingPromotion save(BookingPromotion entity);
    void deleteById(UUID id);
}
