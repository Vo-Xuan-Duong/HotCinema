package com.example.cinema.service.impl;

import com.example.cinema.entity.Auditorium;
import com.example.cinema.repository.AuditoriumRepository;
import com.example.cinema.service.AuditoriumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;
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
public class AuditoriumServiceImpl implements AuditoriumService {

    private final AuditoriumRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Auditorium> findAll(Pageable pageable) {
        return repository.findAllByIsActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "auditoriums", key = "#id")
    public Optional<Auditorium> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditoriums", key = "#result.id")
    public Auditorium save(Auditorium entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditoriums", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            entity.setDeletedAt(ZonedDateTime.now());
            repository.save(entity);
        });
    }
}
