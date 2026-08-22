package com.example.cinema.controller;

import com.example.cinema.entity.BookingSeat;
import com.example.cinema.service.BookingSeatService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.BookingSeatMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.bookingseat.BookingSeatCreateRequest;
import com.example.cinema.dto.bookingseat.BookingSeatUpdateRequest;
import com.example.cinema.dto.bookingseat.BookingSeatResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookingseats")
public class BookingSeatController {

    private final BookingSeatService bookingSeatService;
    private final BookingSeatMapper bookingSeatMapper;

    public BookingSeatController(BookingSeatService bookingSeatService, BookingSeatMapper bookingSeatMapper) {
        this.bookingSeatService = bookingSeatService;
        this.bookingSeatMapper = bookingSeatMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<BookingSeatResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<BookingSeatResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingSeatResponse>> getById(@PathVariable UUID id) {
        BookingSeatResponse res = bookingSeatService.findById(id)
                .map(bookingSeatMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("BookingSeat", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingSeatResponse>> create(@Valid @RequestBody BookingSeatCreateRequest request) {
        BookingSeat entity = bookingSeatMapper.toEntity(request);
        BookingSeat saved = bookingSeatService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingSeatResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingSeatUpdateRequest request) {
        BookingSeat existing = bookingSeatService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingSeat", id.toString()));
        bookingSeatMapper.updateEntityFromRequest(request, existing);
        BookingSeat saved = bookingSeatService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingSeatService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingSeat", id.toString()));
        bookingSeatService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
