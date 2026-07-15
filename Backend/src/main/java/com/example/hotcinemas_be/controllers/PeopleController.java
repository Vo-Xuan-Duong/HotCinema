package com.example.hotcinemas_be.controllers;


import com.example.hotcinemas_be.common.ApiResponse;
import com.example.hotcinemas_be.dtos.people.requests.PeopleRequest;
import com.example.hotcinemas_be.services.PeopleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/people")
@RequiredArgsConstructor
@Tag(name = "People Management", description = "APIs for managing cast/director people in the cinema system")
public class PeopleController {

    private final PeopleService peopleService;

    @Operation(summary = "Create people", description = "Create a new people (CAST/DIRECTOR).")
    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody PeopleRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(peopleService.createPeople(request), httpRequest, HttpStatus.CREATED));
}

    @Operation(summary = "Get people by id", description = "Retrieve a people by its id.")
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(peopleService.getPeopleById(id), httpRequest, HttpStatus.OK));
}

    @Operation(summary = "Get people page", description = "Retrieve people list with pagination.")
    @GetMapping
    public ResponseEntity<?> getPage(@PageableDefault(page = 0, size = 10) Pageable pageable, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(peopleService.getPagePeople(pageable), httpRequest, HttpStatus.OK));
}

    @Operation(summary = "Get all people", description = "Retrieve all people without pagination.")
    @GetMapping("/all")
    public ResponseEntity<?> getAll(HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(peopleService.getAllPeople(), httpRequest, HttpStatus.OK));
}

    @Operation(summary = "Update people", description = "Update a people by id.")
    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @Valid @RequestBody PeopleRequest request, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(peopleService.updatePeople(id, request), httpRequest, HttpStatus.OK));
}

    @Operation(summary = "Delete people", description = "Delete a people by id.")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, HttpServletRequest httpRequest) {
        peopleService.deletePeople(id);
        return ResponseEntity.ok(ApiResponse.success(null, httpRequest, HttpStatus.OK));
}

    @Operation(summary = "Get cast/directors by movie", description = "Retrieve actors and directors for a movie.")
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<?> getPeopleByMovie(@PathVariable Long movieId, HttpServletRequest httpRequest) {
        return ResponseEntity.ok(ApiResponse.success(peopleService.getPeopleByMovie(movieId), httpRequest, HttpStatus.OK));
}
}

