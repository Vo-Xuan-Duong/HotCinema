package com.example.cinema.service;

import com.example.cinema.entity.Auditorium;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AuditoriumService {
    List<Auditorium> findAll();
    Optional<Auditorium> findById(UUID id);
    Auditorium save(Auditorium entity);
    void deleteById(UUID id);
}
