package com.example.cinema.service.impl;

import com.example.cinema.entity.Cinema;
import com.example.cinema.repository.CinemaRepository;
import com.example.cinema.service.CinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Cinema> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Cinema> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Cinema save(Cinema entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
