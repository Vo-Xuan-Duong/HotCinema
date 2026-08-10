package com.example.cinema.service;

import com.example.cinema.entity.BookingItem;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingItemService {
    List<BookingItem> findAll();
    Optional<BookingItem> findById(UUID id);
    BookingItem save(BookingItem entity);
    void deleteById(UUID id);
}
