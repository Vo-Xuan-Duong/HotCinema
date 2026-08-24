package com.example.cinema.controller;

import com.example.cinema.common.response.ApiResponse;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.movie.MovieCreateRequest;
import com.example.cinema.dto.movie.MovieResponse;
import com.example.cinema.dto.movie.MovieUpdateRequest;
import com.example.cinema.entity.enums.MovieStatus;
import com.example.cinema.service.MovieService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id", "title", "releaseDate", "createdAt", "updatedAt", "durationMinutes", "status"
    );

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
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.findPage(toPageable(page, size, sort))));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) MovieStatus status,
            @RequestParam(required = false) Integer releaseYear,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id,desc") String sort) {
        Pageable pageable = toPageable(page, size, sort);
        return ResponseEntity.ok(new ApiResponse<>(movieService.search(keyword, genre, status, releaseYear, pageable)));
    }

    @GetMapping("/now-showing")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getNowShowing(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "releaseDate,desc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.search(
                null, null, MovieStatus.NOW_SHOWING, null, toPageable(page, size, sort)
        )));
    }

    @GetMapping("/coming-soon")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getComingSoon(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "releaseDate,asc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.search(
                null, null, MovieStatus.COMING_SOON, null, toPageable(page, size, sort)
        )));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<ApiResponse<PageResponse<MovieResponse>>> getByGenre(
            @PathVariable String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @RequestParam(defaultValue = "releaseDate,desc") String sort) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.search(
                null, genre, null, null, toPageable(page, size, sort)
        )));
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
    public ResponseEntity<ApiResponse<MovieResponse>> update(
            @PathVariable UUID id,
            @Valid @RequestBody MovieUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(movieService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        movieService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private Pageable toPageable(int page, int size, String sort) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 100);
        String[] sortParts = sort == null ? new String[0] : sort.split(",", 2);
        String property = sortParts.length > 0 && ALLOWED_SORT_FIELDS.contains(sortParts[0])
                ? sortParts[0]
                : "id";
        Sort.Direction direction = sortParts.length > 1 && "asc".equalsIgnoreCase(sortParts[1])
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;
        return PageRequest.of(safePage, safeSize, Sort.by(direction, property));
    }
}
