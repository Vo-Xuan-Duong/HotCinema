package com.example.cinema.controller;

import com.example.cinema.entity.Showtime;
import com.example.cinema.service.ShowtimeService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.ShowtimeMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;
    private final ShowtimeMapper showtimeMapper;

    public ShowtimeController(ShowtimeService showtimeService, ShowtimeMapper showtimeMapper) {
        this.showtimeService = showtimeService;
        this.showtimeMapper = showtimeMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ShowtimeResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Showtime> pageResult = showtimeService.findAll(pageable);
        Page<ShowtimeResponse> responsePage = pageResult.map(showtimeMapper::toResponse);
        PageResponse<ShowtimeResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getById(@PathVariable UUID id) {
        ShowtimeResponse res = showtimeService.findById(id)
                .map(showtimeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeResponse>> create(@Valid @RequestBody ShowtimeCreateRequest request) {
        Showtime entity = showtimeMapper.toEntity(request);
        Showtime saved = showtimeService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(showtimeMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> update(@PathVariable UUID id, @Valid @RequestBody ShowtimeUpdateRequest request) {
        Showtime existing = showtimeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
        showtimeMapper.updateEntityFromRequest(request, existing);
        Showtime saved = showtimeService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(showtimeMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimeService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
        showtimeService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}