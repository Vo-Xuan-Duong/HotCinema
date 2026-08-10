package com.example.cinema.service.impl;

import com.example.cinema.entity.SeatType;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.service.SeatTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatTypeServiceImpl implements SeatTypeService {

    private final SeatTypeRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<SeatType> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<SeatType> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public SeatType save(SeatType entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
