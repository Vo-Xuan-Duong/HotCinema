package com.example.cinema.service.impl;

import com.example.cinema.entity.EmployeeCinema;
import com.example.cinema.repository.EmployeeCinemaRepository;
import com.example.cinema.service.EmployeeCinemaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeCinemaServiceImpl implements EmployeeCinemaService {

    private final EmployeeCinemaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeCinema> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<EmployeeCinema> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public EmployeeCinema save(EmployeeCinema entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
