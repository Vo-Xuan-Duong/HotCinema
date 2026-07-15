package com.example.hotcinemas_be.controllers;


import com.example.hotcinemas_be.common.ApiResponse;
import com.example.hotcinemas_be.dtos.movie_version.requests.MovieVersionRequest;
import com.example.hotcinemas_be.services.MovieVersionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/movie-versions")
@RequiredArgsConstructor
@Tag(name = "Movie Version Management", description = "APIs for managing movie versions in the cinema system")
public class MovieVersionController {

    private final MovieVersionService movieVersionService;

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody MovieVersionRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(movieVersionService.create(request), httpRequest, HttpStatus.CREATED));
}

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(movieVersionService.getById(id), httpRequest, HttpStatus.OK));
}

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam(required = false) Long movieId, HttpServletRequest httpRequest) {
        Object data = (movieId != null)
                ? movieVersionService.getMovieVersionByMovie(movieId)
                : movieVersionService.getAll();

        return ResponseEntity.ok(ApiResponse.success(data, httpRequest, HttpStatus.OK));
}

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody MovieVersionRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(movieVersionService.update(id, request), httpRequest, HttpStatus.OK));
}

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        movieVersionService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success(null, httpRequest, HttpStatus.OK));
}
}

