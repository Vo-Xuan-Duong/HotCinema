package com.example.cinema.service.impl;

import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.service.ShowtimeSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeSeatServiceImpl implements ShowtimeSeatService {

    private final ShowtimeSeatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeSeat> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ShowtimeSeat> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public ShowtimeSeat save(ShowtimeSeat entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
