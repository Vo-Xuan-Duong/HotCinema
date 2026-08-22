package com.example.cinema.service.impl;

import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.service.ShowtimeSeatService;
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
public class ShowtimeSeatServiceImpl implements ShowtimeSeatService {

    private final ShowtimeSeatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<ShowtimeSeat> findAll(Pageable pageable) {
        return repository.findAllByIsActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimeseats", key = "#id")
    public Optional<ShowtimeSeat> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", key = "#result.id")
    public ShowtimeSeat save(ShowtimeSeat entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
