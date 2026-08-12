package com.example.cinema.service.impl;

import com.example.cinema.entity.Cinema;
import com.example.cinema.repository.CinemaRepository;
import com.example.cinema.service.CinemaService;
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
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Cinema> findAll(Pageable pageable) {
        return repository.findAllByIsDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "cinemas", key = "#id")
    public Optional<Cinema> findById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemas", key = "#result.id")
    public Cinema save(Cinema entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemas", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsDeletedFalse(id).ifPresent(entity -> {
            entity.setDeleted(true);
            entity.setDeletedAt(ZonedDateTime.now());
            repository.save(entity);
        });
    }
}
