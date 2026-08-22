package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.bookingseat.BookingSeatCreateRequest;
import com.example.cinema.dto.bookingseat.BookingSeatUpdateRequest;
import com.example.cinema.dto.bookingseat.BookingSeatResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface BookingSeatService {
    List<BookingSeatResponse> findAll();
    PageResponse<BookingSeatResponse> findPage(Pageable pageable);
    BookingSeatResponse findById(UUID id);
    BookingSeatResponse create(BookingSeatCreateRequest request);
    BookingSeatResponse update(UUID id, BookingSeatUpdateRequest request);
    void deleteById(UUID id);
}
