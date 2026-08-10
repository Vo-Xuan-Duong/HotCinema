package com.example.cinema.service.impl;

import com.example.cinema.entity.Promotion;
import com.example.cinema.repository.PromotionRepository;
import com.example.cinema.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Promotion> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Promotion> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Promotion save(Promotion entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
