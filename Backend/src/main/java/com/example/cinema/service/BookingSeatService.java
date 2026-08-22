package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.BookingSeat;
import com.example.cinema.dto.bookingseat.BookingSeatResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingSeatService {
    List<BookingSeatResponse> findAll();
    PageResponse<BookingSeatResponse> findPage(Pageable pageable);
    Optional<BookingSeat> findById(UUID id);
    BookingSeat save(BookingSeat entity);
    void deleteById(UUID id);
}
