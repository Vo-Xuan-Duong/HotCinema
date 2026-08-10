package com.example.cinema.service.impl;

import com.example.cinema.entity.Seat;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {

    private final SeatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Seat> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Seat> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Seat save(Seat entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
