package com.example.cinema.controller;

import com.example.cinema.entity.Booking;
import com.example.cinema.service.BookingService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final BookingMapper bookingMapper;

    public BookingController(BookingService bookingService, BookingMapper bookingMapper) {
        this.bookingService = bookingService;
        this.bookingMapper = bookingMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<BookingResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> pageResult = bookingService.findAll(pageable);
        Page<BookingResponse> responsePage = pageResult.map(bookingMapper::toResponse);
        PageResponse<BookingResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> getById(@PathVariable UUID id) {
        BookingResponse res = bookingService.findById(id)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponse>> create(@Valid @RequestBody BookingCreateRequest request) {
        Booking entity = bookingMapper.toEntity(request);
        Booking saved = bookingService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(bookingMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingUpdateRequest request) {
        Booking existing = bookingService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        bookingMapper.updateEntityFromRequest(request, existing);
        Booking saved = bookingService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(bookingMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        bookingService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}