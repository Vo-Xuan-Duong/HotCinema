package com.example.cinema.controller;

import com.example.cinema.entity.BookingItem;
import com.example.cinema.service.BookingItemService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.BookingItemMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.bookingitem.BookingItemCreateRequest;
import com.example.cinema.dto.bookingitem.BookingItemUpdateRequest;
import com.example.cinema.dto.bookingitem.BookingItemResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookingitems")
public class BookingItemController {

    private final BookingItemService bookingItemService;
    private final BookingItemMapper bookingItemMapper;

    public BookingItemController(BookingItemService bookingItemService, BookingItemMapper bookingItemMapper) {
        this.bookingItemService = bookingItemService;
        this.bookingItemMapper = bookingItemMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookingItemResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<BookingItem> pageResult = bookingItemService.findAll(pageable);
        Page<BookingItemResponse> responsePage = pageResult.map(bookingItemMapper::toResponse);
        PageResponse<BookingItemResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingItemResponse>> getById(@PathVariable UUID id) {
        BookingItemResponse res = bookingItemService.findById(id)
                .map(bookingItemMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("BookingItem", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingItemResponse>> create(@Valid @RequestBody BookingItemCreateRequest request) {
        BookingItem entity = bookingItemMapper.toEntity(request);
        BookingItem saved = bookingItemService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(bookingItemMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingItemResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingItemUpdateRequest request) {
        BookingItem existing = bookingItemService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingItem", id.toString()));
        bookingItemMapper.updateEntityFromRequest(request, existing);
        BookingItem saved = bookingItemService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(bookingItemMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingItemService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingItem", id.toString()));
        bookingItemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}