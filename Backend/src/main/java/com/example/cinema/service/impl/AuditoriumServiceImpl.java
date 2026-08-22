package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Auditorium;
import com.example.cinema.dto.auditorium.AuditoriumCreateRequest;
import com.example.cinema.dto.auditorium.AuditoriumUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.auditorium.AuditoriumResponse;
import com.example.cinema.mapper.AuditoriumMapper;
import com.example.cinema.repository.AuditoriumRepository;
import com.example.cinema.service.AuditoriumService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuditoriumServiceImpl implements AuditoriumService {

    private final AuditoriumRepository repository;
    private final AuditoriumMapper auditoriumMapper;

    @Override
    @Transactional(readOnly = true)
    public List<AuditoriumResponse> findAll() {
        return auditoriumMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditoriumResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(auditoriumMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "auditoriums", key = "#id")
    public AuditoriumResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(auditoriumMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Auditorium", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditoriums", allEntries = true)
    public AuditoriumResponse create(AuditoriumCreateRequest request) {
        Auditorium entity = auditoriumMapper.toEntity(request);
        return auditoriumMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditoriums", allEntries = true)
    public AuditoriumResponse update(UUID id, AuditoriumUpdateRequest request) {
        Auditorium entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auditorium", id.toString()));
        auditoriumMapper.updateEntityFromRequest(request, entity);
        return auditoriumMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "auditoriums", key = "#id")
    public void deleteById(UUID id) {
        Auditorium entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auditorium", id.toString()));
        entity.setActive(false);
        entity.setDeletedAt(ZonedDateTime.now());
        repository.save(entity);
    }
}
