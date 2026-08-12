package com.example.cinema.controller;

import com.example.cinema.entity.EmployeeCinema;
import com.example.cinema.service.EmployeeCinemaService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.EmployeeCinemaMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.employeecinema.EmployeeCinemaCreateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaUpdateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.common.response.PageMapper;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employeecinemas")
public class EmployeeCinemaController {

    private final EmployeeCinemaService employeeCinemaService;
    private final EmployeeCinemaMapper employeeCinemaMapper;

    public EmployeeCinemaController(EmployeeCinemaService employeeCinemaService, EmployeeCinemaMapper employeeCinemaMapper) {
        this.employeeCinemaService = employeeCinemaService;
        this.employeeCinemaMapper = employeeCinemaMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<EmployeeCinemaResponse>>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<EmployeeCinema> pageResult = employeeCinemaService.findAll(pageable);
        Page<EmployeeCinemaResponse> responsePage = pageResult.map(employeeCinemaMapper::toResponse);
        PageResponse<EmployeeCinemaResponse> response = PageMapper.toPageResponse(responsePage);
        return ResponseEntity.ok(new ApiResponse<>(response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeCinemaResponse>> getById(@PathVariable UUID id) {
        EmployeeCinemaResponse res = employeeCinemaService.findById(id)
                .map(employeeCinemaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeCinema", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeCinemaResponse>> create(@Valid @RequestBody EmployeeCinemaCreateRequest request) {
        EmployeeCinema entity = employeeCinemaMapper.toEntity(request);
        EmployeeCinema saved = employeeCinemaService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeCinemaResponse>> update(@PathVariable UUID id, @Valid @RequestBody EmployeeCinemaUpdateRequest request) {
        EmployeeCinema existing = employeeCinemaService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeCinema", id.toString()));
        employeeCinemaMapper.updateEntityFromRequest(request, existing);
        EmployeeCinema saved = employeeCinemaService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(employeeCinemaMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        employeeCinemaService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EmployeeCinema", id.toString()));
        employeeCinemaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}