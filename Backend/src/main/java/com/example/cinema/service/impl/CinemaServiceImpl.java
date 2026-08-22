package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Cinema;
import com.example.cinema.dto.cinema.CinemaCreateRequest;
import com.example.cinema.dto.cinema.CinemaUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.cinema.CinemaResponse;
import com.example.cinema.mapper.CinemaMapper;
import com.example.cinema.repository.CinemaRepository;
import com.example.cinema.service.CinemaService;
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
public class CinemaServiceImpl implements CinemaService {

    private final CinemaRepository repository;
    private final CinemaMapper cinemaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CinemaResponse> findAll() {
        return cinemaMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CinemaResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(cinemaMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "cinemas", key = "#id")
    public CinemaResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(cinemaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemas", allEntries = true)
    public CinemaResponse create(CinemaCreateRequest request) {
        Cinema entity = cinemaMapper.toEntity(request);
        return cinemaMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemas", allEntries = true)
    public CinemaResponse update(UUID id, CinemaUpdateRequest request) {
        Cinema entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", id.toString()));
        cinemaMapper.updateEntityFromRequest(request, entity);
        return cinemaMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemas", key = "#id")
    public void deleteById(UUID id) {
        Cinema entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", id.toString()));
        entity.setActive(false);
        entity.setDeletedAt(ZonedDateTime.now());
        repository.save(entity);
    }
}
