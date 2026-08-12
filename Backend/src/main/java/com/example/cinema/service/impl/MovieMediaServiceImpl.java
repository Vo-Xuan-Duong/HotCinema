package com.example.cinema.service.impl;

import com.example.cinema.entity.MovieMedia;
import com.example.cinema.repository.MovieMediaRepository;
import com.example.cinema.service.MovieMediaService;
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
public class MovieMediaServiceImpl implements MovieMediaService {

    private final MovieMediaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<MovieMedia> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "moviemedias", key = "#id")
    public Optional<MovieMedia> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", key = "#result.id")
    public MovieMedia save(MovieMedia entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
