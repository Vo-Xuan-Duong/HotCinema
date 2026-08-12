package com.example.cinema.service.impl;

import com.example.cinema.entity.Movie;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.service.MovieService;
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
public class MovieServiceImpl implements MovieService {

    private final MovieRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Movie> findAll(Pageable pageable) {
        return repository.findAllByIsDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movies", key = "#id")
    public Optional<Movie> findById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", key = "#result.id")
    public Movie save(Movie entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsDeletedFalse(id).ifPresent(entity -> {
            entity.setDeleted(true);
            entity.setDeletedAt(ZonedDateTime.now());
            repository.save(entity);
        });
    }
}
