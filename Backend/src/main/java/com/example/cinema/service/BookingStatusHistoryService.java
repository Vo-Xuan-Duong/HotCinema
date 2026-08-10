package com.example.cinema.service;

import com.example.cinema.entity.BookingStatusHistory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingStatusHistoryService {
    List<BookingStatusHistory> findAll();
    Optional<BookingStatusHistory> findById(UUID id);
    BookingStatusHistory save(BookingStatusHistory entity);
    void deleteById(UUID id);
}
