package com.example.cinema.service;

import com.example.cinema.entity.BookingItem;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingItemService {
    Page<BookingItem> findAll(Pageable pageable);
    Optional<BookingItem> findById(UUID id);
    BookingItem save(BookingItem entity);
    void deleteById(UUID id);
}
