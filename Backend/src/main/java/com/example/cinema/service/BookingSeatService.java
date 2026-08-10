package com.example.cinema.service;

import com.example.cinema.entity.BookingSeat;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingSeatService {
    List<BookingSeat> findAll();
    Optional<BookingSeat> findById(UUID id);
    BookingSeat save(BookingSeat entity);
    void deleteById(UUID id);
}
