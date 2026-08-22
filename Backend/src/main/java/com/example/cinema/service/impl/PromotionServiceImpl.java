package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Promotion;
import com.example.cinema.dto.promotion.PromotionCreateRequest;
import com.example.cinema.dto.promotion.PromotionUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.promotion.PromotionResponse;
import com.example.cinema.mapper.PromotionMapper;
import com.example.cinema.repository.PromotionRepository;
import com.example.cinema.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository repository;
    private final PromotionMapper promotionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> findAll() {
        return promotionMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(promotionMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotions", key = "#id")
    public PromotionResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(promotionMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public PromotionResponse create(PromotionCreateRequest request) {
        Promotion entity = promotionMapper.toEntity(request);
        return promotionMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotions", allEntries = true)
    public PromotionResponse update(UUID id, PromotionUpdateRequest request) {
        Promotion entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Promotion", id.toString()));
        promotionMapper.updateEntityFromRequest(request, entity);
        return promotionMapper.toResponse(repository.save(entity));
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
