package com.example.cinema.service;

import com.example.cinema.entity.EmployeeCinema;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeCinemaService {
    List<EmployeeCinema> findAll();
    Optional<EmployeeCinema> findById(UUID id);
    EmployeeCinema save(EmployeeCinema entity);
    void deleteById(UUID id);
}
