package com.example.cinema.service.impl;

import com.example.cinema.entity.ShowtimePrice;
import com.example.cinema.repository.ShowtimePriceRepository;
import com.example.cinema.service.ShowtimePriceService;
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
public class ShowtimePriceServiceImpl implements ShowtimePriceService {

    private final ShowtimePriceRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<ShowtimePrice> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimeprices", key = "#id")
    public Optional<ShowtimePrice> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeprices", key = "#result.id")
    public ShowtimePrice save(ShowtimePrice entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeprices", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
