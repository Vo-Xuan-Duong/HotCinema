package com.example.cinema.service.impl;

import com.example.cinema.entity.PromotionCode;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.service.PromotionCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionCodeServiceImpl implements PromotionCodeService {

    private final PromotionCodeRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<PromotionCode> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PromotionCode> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public PromotionCode save(PromotionCode entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
