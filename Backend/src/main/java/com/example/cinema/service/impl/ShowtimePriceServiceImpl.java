package com.example.cinema.service.impl;

import com.example.cinema.entity.ShowtimePrice;
import com.example.cinema.repository.ShowtimePriceRepository;
import com.example.cinema.service.ShowtimePriceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimePriceServiceImpl implements ShowtimePriceService {

    private final ShowtimePriceRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimePrice> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ShowtimePrice> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public ShowtimePrice save(ShowtimePrice entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
