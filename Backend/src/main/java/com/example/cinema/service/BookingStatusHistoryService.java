package com.example.cinema.service;

import com.example.cinema.entity.BookingStatusHistory;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingStatusHistoryService {
    Page<BookingStatusHistory> findAll(Pageable pageable);
    Optional<BookingStatusHistory> findById(UUID id);
    BookingStatusHistory save(BookingStatusHistory entity);
    void deleteById(UUID id);
}
