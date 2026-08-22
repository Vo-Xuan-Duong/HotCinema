package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.BookingItem;
import com.example.cinema.dto.bookingitem.BookingItemResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface BookingItemService {
    List<BookingItemResponse> findAll();
    PageResponse<BookingItemResponse> findPage(Pageable pageable);
    Optional<BookingItem> findById(UUID id);
    BookingItem save(BookingItem entity);
    void deleteById(UUID id);
}
