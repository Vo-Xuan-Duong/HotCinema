package com.example.cinema.service.impl;

import com.example.cinema.entity.CinemaProduct;
import com.example.cinema.repository.CinemaProductRepository;
import com.example.cinema.service.CinemaProductService;
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
public class CinemaProductServiceImpl implements CinemaProductService {

    private final CinemaProductRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<CinemaProduct> findAll(Pageable pageable) {
        return repository.findAllByIsActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "cinemaproducts", key = "#id")
    public Optional<CinemaProduct> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemaproducts", key = "#result.id")
    public CinemaProduct save(CinemaProduct entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemaproducts", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
