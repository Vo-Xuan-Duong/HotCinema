package com.example.cinema.controller;

import com.example.cinema.service.MovieService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.movie.MovieCreateRequest;
import com.example.cinema.dto.movie.MovieUpdateRequest;
import com.example.cinema.dto.movie.MovieResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    private final MovieService movieService;

    public MovieController(MovieService movieService) {
        this.movieService = movieService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(movieService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(movieService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> create(@Valid @RequestBody MovieCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> update(@PathVariable UUID id, @Valid @RequestBody MovieUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        movieService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
