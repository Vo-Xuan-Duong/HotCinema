package com.example.cinema.service.impl;

import com.example.cinema.entity.Showtime;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Showtime> findAll(Pageable pageable) {
        return repository.findAllByIsDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimes", key = "#id")
    public Optional<Showtime> findById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", key = "#result.id")
    public Showtime save(Showtime entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsDeletedFalse(id).ifPresent(entity -> {
            entity.setDeleted(true);
            repository.save(entity);
        });
    }
}
