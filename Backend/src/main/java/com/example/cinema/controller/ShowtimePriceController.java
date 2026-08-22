package com.example.cinema.controller;

import com.example.cinema.entity.ShowtimePrice;
import com.example.cinema.service.ShowtimePriceService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.ShowtimePriceMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final ShowtimePriceMapper showtimePriceMapper;

    public ShowtimePriceController(ShowtimePriceService showtimePriceService, ShowtimePriceMapper showtimePriceMapper) {
        this.showtimePriceService = showtimePriceService;
        this.showtimePriceMapper = showtimePriceMapper;
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
        ShowtimePriceResponse res = showtimePriceService.findById(id)
                .map(showtimePriceMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimePrice", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimePriceResponse>> create(@Valid @RequestBody ShowtimePriceCreateRequest request) {
        ShowtimePrice entity = showtimePriceMapper.toEntity(request);
        ShowtimePrice saved = showtimePriceService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimePriceResponse>> update(@PathVariable UUID id, @Valid @RequestBody ShowtimePriceUpdateRequest request) {
        ShowtimePrice existing = showtimePriceService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimePrice", id.toString()));
        showtimePriceMapper.updateEntityFromRequest(request, existing);
        ShowtimePrice saved = showtimePriceService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(showtimePriceMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimePriceService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimePrice", id.toString()));
        showtimePriceService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
