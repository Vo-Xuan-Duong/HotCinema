package com.example.cinema.controller;

import com.example.cinema.service.BookingSeatService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
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

    public BookingSeatController(BookingSeatService bookingSeatService) {
        this.bookingSeatService = bookingSeatService;
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
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingSeatResponse>> create(@Valid @RequestBody BookingSeatCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingSeatResponse>> update(@PathVariable UUID id, @Valid @RequestBody BookingSeatUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(bookingSeatService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        bookingSeatService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
