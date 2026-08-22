package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.PromotionCode;
import com.example.cinema.dto.promotioncode.PromotionCodeCreateRequest;
import com.example.cinema.dto.promotioncode.PromotionCodeUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.promotioncode.PromotionCodeResponse;
import com.example.cinema.mapper.PromotionCodeMapper;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.service.PromotionCodeService;
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
public class PromotionCodeServiceImpl implements PromotionCodeService {

    private final PromotionCodeRepository repository;
    private final PromotionCodeMapper promotionCodeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<PromotionCodeResponse> findAll() {
        return promotionCodeMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PromotionCodeResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(promotionCodeMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "promotioncodes", key = "#id")
    public PromotionCodeResponse findById(UUID id) {
        return repository.findById(id)
                .map(promotionCodeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("PromotionCode", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotioncodes", allEntries = true)
    public PromotionCodeResponse create(PromotionCodeCreateRequest request) {
        PromotionCode entity = promotionCodeMapper.toEntity(request);
        return promotionCodeMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotioncodes", allEntries = true)
    public PromotionCodeResponse update(UUID id, PromotionCodeUpdateRequest request) {
        PromotionCode entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PromotionCode", id.toString()));
        promotionCodeMapper.updateEntityFromRequest(request, entity);
        return promotionCodeMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "promotioncodes", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
