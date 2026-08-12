package com.example.cinema.service.impl;

import com.example.cinema.entity.PromotionCode;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.service.PromotionCodeService;
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
public class PromotionCodeServiceImpl implements PromotionCodeService {

    private final PromotionCodeRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<PromotionCode> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotioncodes", key = "#id")
    public Optional<PromotionCode> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotioncodes", key = "#result.id")
    public PromotionCode save(PromotionCode entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotioncodes", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
