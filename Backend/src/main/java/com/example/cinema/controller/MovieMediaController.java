package com.example.cinema.controller;

import com.example.cinema.service.MovieMediaService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.moviemedia.MovieMediaCreateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaUpdateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/moviemedias")
public class MovieMediaController {

    private final MovieMediaService movieMediaService;

    public MovieMediaController(MovieMediaService movieMediaService) {
        this.movieMediaService = movieMediaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieMediaResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(movieMediaService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<MovieMediaResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(movieMediaService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieMediaResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(movieMediaService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieMediaResponse>> create(@Valid @RequestBody MovieMediaCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(movieMediaService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieMediaResponse>> update(@PathVariable UUID id, @Valid @RequestBody MovieMediaUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(movieMediaService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        movieMediaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
