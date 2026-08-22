package com.example.cinema.controller;

import com.example.cinema.service.EmployeeCinemaService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.dto.employeecinema.EmployeeCinemaCreateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaUpdateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employeecinemas")
public class EmployeeCinemaController {

    private final EmployeeCinemaService employeeCinemaService;

    public EmployeeCinemaController(EmployeeCinemaService employeeCinemaService) {
        this.employeeCinemaService = employeeCinemaService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EmployeeCinemaResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<EmployeeCinemaResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeCinemaResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeCinemaResponse>> create(@Valid @RequestBody EmployeeCinemaCreateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeCinemaResponse>> update(@PathVariable UUID id, @Valid @RequestBody EmployeeCinemaUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        employeeCinemaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
