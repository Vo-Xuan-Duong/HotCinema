package com.example.cinema.service;

import com.example.cinema.entity.BookingSeat;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingSeatService {
    Page<BookingSeat> findAll(Pageable pageable);
    Optional<BookingSeat> findById(UUID id);
    BookingSeat save(BookingSeat entity);
    void deleteById(UUID id);
}
