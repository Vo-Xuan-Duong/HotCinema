package com.example.cinema.service.impl;

import com.example.cinema.entity.Seat;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.service.SeatService;
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
public class SeatServiceImpl implements SeatService {

    private final SeatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Seat> findAll(Pageable pageable) {
        return repository.findAllByIsActiveTrue(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "seats", key = "#id")
    public Optional<Seat> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "seats", key = "#result.id")
    public Seat save(Seat entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "seats", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
