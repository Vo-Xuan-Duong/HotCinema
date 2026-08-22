package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Showtime;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.mapper.ShowtimeMapper;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.service.ShowtimeService;
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
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository repository;
    private final ShowtimeMapper showtimeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> findAll() {
        return showtimeMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShowtimeResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(showtimeMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimes", key = "#id")
    public ShowtimeResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(showtimeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", allEntries = true)
    public ShowtimeResponse create(ShowtimeCreateRequest request) {
        Showtime entity = showtimeMapper.toEntity(request);
        return showtimeMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", allEntries = true)
    public ShowtimeResponse update(UUID id, ShowtimeUpdateRequest request) {
        Showtime entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
        showtimeMapper.updateEntityFromRequest(request, entity);
        return showtimeMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
