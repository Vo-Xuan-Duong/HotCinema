package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.employeecinema.EmployeeCinemaCreateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaUpdateRequest;
import com.example.cinema.dto.employeecinema.EmployeeCinemaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface EmployeeCinemaService {
    List<EmployeeCinemaResponse> findAll();
    PageResponse<EmployeeCinemaResponse> findPage(Pageable pageable);
    EmployeeCinemaResponse findById(UUID id);
    EmployeeCinemaResponse create(EmployeeCinemaCreateRequest request);
    EmployeeCinemaResponse update(UUID id, EmployeeCinemaUpdateRequest request);
    void deleteById(UUID id);
}
