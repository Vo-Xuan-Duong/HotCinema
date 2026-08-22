package com.example.cinema.controller;

import com.example.cinema.service.GenreService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.genre.GenreCreateRequest;
import com.example.cinema.dto.genre.GenreUpdateRequest;
import com.example.cinema.dto.genre.GenreResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/genres")
public class GenreController {

    private final GenreService genreService;

    public GenreController(GenreService genreService) {
        this.genreService = genreService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(genreService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<GenreResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(genreService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(genreService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GenreResponse>> create(@Valid @RequestBody GenreCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(genreService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> update(@PathVariable UUID id, @Valid @RequestBody GenreUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(genreService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        genreService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
