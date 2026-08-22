package com.example.cinema.controller;

import com.example.cinema.entity.BookingPromotion;
import com.example.cinema.service.BookingPromotionService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.BookingPromotionMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final BookingPromotionMapper bookingPromotionMapper;

    public BookingPromotionController(BookingPromotionService bookingPromotionService, BookingPromotionMapper bookingPromotionMapper) {
        this.bookingPromotionService = bookingPromotionService;
        this.bookingPromotionMapper = bookingPromotionMapper;
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
        BookingPromotionResponse res = bookingPromotionService.findById(id)
                .map(bookingPromotionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("BookingPromotion", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingPromotionResponse>> create(@Valid @RequestBody BookingPromotionCreateRequest request) {
        BookingPromotion entity = bookingPromotionMapper.toEntity(request);
        BookingPromotion saved = bookingPromotionService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingPromotionResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingPromotionUpdateRequest request) {
        BookingPromotion existing = bookingPromotionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingPromotion", id.toString()));
        bookingPromotionMapper.updateEntityFromRequest(request, existing);
        BookingPromotion saved = bookingPromotionService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(bookingPromotionMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingPromotionService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingPromotion", id.toString()));
        bookingPromotionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
