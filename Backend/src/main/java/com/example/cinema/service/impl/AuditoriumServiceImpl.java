package com.example.cinema.service.impl;

import com.example.cinema.entity.Auditorium;
import com.example.cinema.repository.AuditoriumRepository;
import com.example.cinema.service.AuditoriumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditoriumServiceImpl implements AuditoriumService {

    private final AuditoriumRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Auditorium> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Auditorium> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Auditorium save(Auditorium entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
