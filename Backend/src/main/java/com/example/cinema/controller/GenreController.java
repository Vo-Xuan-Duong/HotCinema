package com.example.cinema.controller;

import com.example.cinema.entity.Genre;
import com.example.cinema.service.GenreService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.GenreMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.genre.GenreCreateRequest;
import com.example.cinema.dto.genre.GenreUpdateRequest;
import com.example.cinema.dto.genre.GenreResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/genres")
public class GenreController {

    private final GenreService genreService;
    private final GenreMapper genreMapper;

    public GenreController(GenreService genreService, GenreMapper genreMapper) {
        this.genreService = genreService;
        this.genreMapper = genreMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<GenreResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Genre> pageResult = genreService.findAll(pageable);
        Page<GenreResponse> responsePage = pageResult.map(genreMapper::toResponse);
        PageResponse<GenreResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> getById(@PathVariable UUID id) {
        GenreResponse res = genreService.findById(id)
                .map(genreMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GenreResponse>> create(@Valid @RequestBody GenreCreateRequest request) {
        Genre entity = genreMapper.toEntity(request);
        Genre saved = genreService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(genreMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> update(@PathVariable UUID id, @Valid @RequestBody GenreUpdateRequest request) {
        Genre existing = genreService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id.toString()));
        genreMapper.updateEntityFromRequest(request, existing);
        Genre saved = genreService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(genreMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        genreService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id.toString()));
        genreService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}