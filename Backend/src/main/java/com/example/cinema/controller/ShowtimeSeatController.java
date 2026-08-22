package com.example.cinema.controller;

import com.example.cinema.service.ShowtimeSeatService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/showtimeseats")
public class ShowtimeSeatController {

    private final ShowtimeSeatService showtimeSeatService;

    public ShowtimeSeatController(ShowtimeSeatService showtimeSeatService) {
        this.showtimeSeatService = showtimeSeatService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeSeatResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<ShowtimeSeatResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> create(@Valid @RequestBody ShowtimeSeatCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> update(@PathVariable UUID id, @Valid @RequestBody ShowtimeSeatUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimeSeatService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
