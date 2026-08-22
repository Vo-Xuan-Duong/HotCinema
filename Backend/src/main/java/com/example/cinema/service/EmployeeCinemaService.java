package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.EmployeeCinema;
import com.example.cinema.dto.employeecinema.EmployeeCinemaResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeCinemaService {
    List<EmployeeCinemaResponse> findAll();
    PageResponse<EmployeeCinemaResponse> findPage(Pageable pageable);
    Optional<EmployeeCinema> findById(UUID id);
    EmployeeCinema save(EmployeeCinema entity);
    void deleteById(UUID id);
}
