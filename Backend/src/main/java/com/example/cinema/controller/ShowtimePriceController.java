package com.example.cinema.controller;

import com.example.cinema.service.ShowtimePriceService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.showtimeprice.ShowtimePriceCreateRequest;
import com.example.cinema.dto.showtimeprice.ShowtimePriceUpdateRequest;
import com.example.cinema.dto.showtimeprice.ShowtimePriceResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/showtimeprices")
public class ShowtimePriceController {

    private final ShowtimePriceService showtimePriceService;

    public ShowtimePriceController(ShowtimePriceService showtimePriceService) {
        this.showtimePriceService = showtimePriceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimePriceResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ShowtimePriceResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimePriceResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimePriceResponse>> create(@Valid @RequestBody ShowtimePriceCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimePriceResponse>> update(@PathVariable UUID id, @Valid @RequestBody ShowtimePriceUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimePriceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
