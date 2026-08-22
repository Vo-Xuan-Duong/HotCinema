package com.example.cinema.controller;

import com.example.cinema.service.BookingStatusHistoryService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
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

    public BookingStatusHistoryController(BookingStatusHistoryService bookingStatusHistoryService) {
        this.bookingStatusHistoryService = bookingStatusHistoryService;
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
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingStatusHistoryResponse>> create(@Valid @RequestBody BookingStatusHistoryCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingStatusHistoryResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingStatusHistoryUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingStatusHistoryService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingStatusHistoryService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
