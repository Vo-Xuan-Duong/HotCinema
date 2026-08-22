package com.example.cinema.controller;

import com.example.cinema.service.BookingItemService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.bookingitem.BookingItemCreateRequest;
import com.example.cinema.dto.bookingitem.BookingItemUpdateRequest;
import com.example.cinema.dto.bookingitem.BookingItemResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookingitems")
public class BookingItemController {

    private final BookingItemService bookingItemService;

    public BookingItemController(BookingItemService bookingItemService) {
        this.bookingItemService = bookingItemService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingItemResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(bookingItemService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<BookingItemResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingItemService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingItemResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(bookingItemService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingItemResponse>> create(@Valid @RequestBody BookingItemCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingItemService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingItemResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingItemUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingItemService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingItemService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
