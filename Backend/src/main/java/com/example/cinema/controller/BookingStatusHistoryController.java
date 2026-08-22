package com.example.cinema.controller;

import com.example.cinema.entity.BookingStatusHistory;
import com.example.cinema.service.BookingStatusHistoryService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.BookingStatusHistoryMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryCreateRequest;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryUpdateRequest;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookingstatushistories")
public class BookingStatusHistoryController {

    private final BookingStatusHistoryService bookingStatusHistoryService;
    private final BookingStatusHistoryMapper bookingStatusHistoryMapper;

    public BookingStatusHistoryController(BookingStatusHistoryService bookingStatusHistoryService, BookingStatusHistoryMapper bookingStatusHistoryMapper) {
        this.bookingStatusHistoryService = bookingStatusHistoryService;
        this.bookingStatusHistoryMapper = bookingStatusHistoryMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingStatusHistoryResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<BookingStatusHistoryResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingStatusHistoryResponse>> getById(@PathVariable UUID id) {
        BookingStatusHistoryResponse res = bookingStatusHistoryService.findById(id)
                .map(bookingStatusHistoryMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("BookingStatusHistory", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingStatusHistoryResponse>> create(@Valid @RequestBody BookingStatusHistoryCreateRequest request) {
        BookingStatusHistory entity = bookingStatusHistoryMapper.toEntity(request);
        BookingStatusHistory saved = bookingStatusHistoryService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingStatusHistoryResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingStatusHistoryUpdateRequest request) {
        BookingStatusHistory existing = bookingStatusHistoryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingStatusHistory", id.toString()));
        bookingStatusHistoryMapper.updateEntityFromRequest(request, existing);
        BookingStatusHistory saved = bookingStatusHistoryService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingStatusHistoryService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingStatusHistory", id.toString()));
        bookingStatusHistoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
