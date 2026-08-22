package com.example.cinema.controller;

import com.example.cinema.entity.Movie;
import com.example.cinema.service.MovieService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.MovieMapper;
import com.example.cinema.exception.ResourceNotFoundException;
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
    private final MovieMapper movieMapper;

    public MovieController(MovieService movieService, MovieMapper movieMapper) {
        this.movieService = movieService;
        this.movieMapper = movieMapper;
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
        MovieResponse res = movieService.findById(id)
                .map(movieMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> create(@Valid @RequestBody MovieCreateRequest request) {
        Movie entity = movieMapper.toEntity(request);
        Movie saved = movieService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(movieMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> update(@PathVariable UUID id, @Valid @RequestBody MovieUpdateRequest request) {
        Movie existing = movieService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        movieMapper.updateEntityFromRequest(request, existing);
        Movie saved = movieService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(movieMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        movieService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        movieService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
