package com.example.cinema.controller;

import com.example.cinema.service.BookingPromotionService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.bookingpromotion.BookingPromotionCreateRequest;
import com.example.cinema.dto.bookingpromotion.BookingPromotionUpdateRequest;
import com.example.cinema.dto.bookingpromotion.BookingPromotionResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookingpromotions")
public class BookingPromotionController {

    private final BookingPromotionService bookingPromotionService;

    public BookingPromotionController(BookingPromotionService bookingPromotionService) {
        this.bookingPromotionService = bookingPromotionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingPromotionResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<BookingPromotionResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingPromotionResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingPromotionResponse>> create(@Valid @RequestBody BookingPromotionCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingPromotionResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingPromotionUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingPromotionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
