package com.example.cinema.controller;

import com.example.cinema.entity.MovieMedia;
import com.example.cinema.service.MovieMediaService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.MovieMediaMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.moviemedia.MovieMediaCreateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaUpdateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/moviemedias")
public class MovieMediaController {

    private final MovieMediaService movieMediaService;
    private final MovieMediaMapper movieMediaMapper;

    public MovieMediaController(MovieMediaService movieMediaService, MovieMediaMapper movieMediaMapper) {
        this.movieMediaService = movieMediaService;
        this.movieMediaMapper = movieMediaMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<MovieMediaResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<MovieMedia> pageResult = movieMediaService.findAll(pageable);
        Page<MovieMediaResponse> responsePage = pageResult.map(movieMediaMapper::toResponse);
        PageResponse<MovieMediaResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieMediaResponse>> getById(@PathVariable UUID id) {
        MovieMediaResponse res = movieMediaService.findById(id)
                .map(movieMediaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("MovieMedia", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MovieMediaResponse>> create(@Valid @RequestBody MovieMediaCreateRequest request) {
        MovieMedia entity = movieMediaMapper.toEntity(request);
        MovieMedia saved = movieMediaService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(movieMediaMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieMediaResponse>> update(@PathVariable UUID id, @Valid @RequestBody MovieMediaUpdateRequest request) {
        MovieMedia existing = movieMediaService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MovieMedia", id.toString()));
        movieMediaMapper.updateEntityFromRequest(request, existing);
        MovieMedia saved = movieMediaService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(movieMediaMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        movieMediaService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MovieMedia", id.toString()));
        movieMediaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}