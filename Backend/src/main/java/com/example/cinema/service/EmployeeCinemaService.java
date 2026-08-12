package com.example.cinema.service;

import com.example.cinema.entity.EmployeeCinema;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeCinemaService {
    Page<EmployeeCinema> findAll(Pageable pageable);
    Optional<EmployeeCinema> findById(UUID id);
    EmployeeCinema save(EmployeeCinema entity);
    void deleteById(UUID id);
}
