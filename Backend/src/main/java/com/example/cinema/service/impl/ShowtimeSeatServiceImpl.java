package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.mapper.ShowtimeSeatMapper;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.service.ShowtimeSeatService;
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
public class ShowtimeSeatServiceImpl implements ShowtimeSeatService {

    private final ShowtimeSeatRepository repository;
    private final ShowtimeSeatMapper showtimeSeatMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeSeatResponse> findAll() {
        return showtimeSeatMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShowtimeSeatResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(showtimeSeatMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimeseats", key = "#id")
    public ShowtimeSeatResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(showtimeSeatMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", allEntries = true)
    public ShowtimeSeatResponse create(ShowtimeSeatCreateRequest request) {
        ShowtimeSeat entity = showtimeSeatMapper.toEntity(request);
        return showtimeSeatMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", allEntries = true)
    public ShowtimeSeatResponse update(UUID id, ShowtimeSeatUpdateRequest request) {
        ShowtimeSeat entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
        showtimeSeatMapper.updateEntityFromRequest(request, entity);
        return showtimeSeatMapper.toResponse(repository.save(entity));
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
