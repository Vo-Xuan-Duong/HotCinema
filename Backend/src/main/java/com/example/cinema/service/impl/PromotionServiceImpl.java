package com.example.cinema.service.impl;

import com.example.cinema.entity.Promotion;
import com.example.cinema.repository.PromotionRepository;
import com.example.cinema.service.PromotionService;
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
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Promotion> findAll(Pageable pageable) {
        return repository.findAllByIsActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotions", key = "#id")
    public Optional<Promotion> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", key = "#result.id")
    public Promotion save(Promotion entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
