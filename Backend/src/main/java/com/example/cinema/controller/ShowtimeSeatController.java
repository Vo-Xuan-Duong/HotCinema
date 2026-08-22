package com.example.cinema.controller;

import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.service.ShowtimeSeatService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.ShowtimeSeatMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final ShowtimeSeatMapper showtimeSeatMapper;

    public ShowtimeSeatController(ShowtimeSeatService showtimeSeatService, ShowtimeSeatMapper showtimeSeatMapper) {
        this.showtimeSeatService = showtimeSeatService;
        this.showtimeSeatMapper = showtimeSeatMapper;
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
        ShowtimeSeatResponse res = showtimeSeatService.findById(id)
                .map(showtimeSeatMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> create(@Valid @RequestBody ShowtimeSeatCreateRequest request) {
        ShowtimeSeat entity = showtimeSeatMapper.toEntity(request);
        ShowtimeSeat saved = showtimeSeatService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeSeatResponse>> update(@PathVariable UUID id, @Valid @RequestBody ShowtimeSeatUpdateRequest request) {
        ShowtimeSeat existing = showtimeSeatService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
        showtimeSeatMapper.updateEntityFromRequest(request, existing);
        ShowtimeSeat saved = showtimeSeatService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(showtimeSeatMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        showtimeSeatService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
        showtimeSeatService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
