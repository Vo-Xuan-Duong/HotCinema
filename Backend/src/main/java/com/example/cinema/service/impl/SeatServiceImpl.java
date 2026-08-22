package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Seat;
import com.example.cinema.dto.seat.SeatCreateRequest;
import com.example.cinema.dto.seat.SeatUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.seat.SeatResponse;
import com.example.cinema.mapper.SeatMapper;
import com.example.cinema.repository.SeatRepository;
import com.example.cinema.service.SeatService;
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
public class SeatServiceImpl implements SeatService {

    private final SeatRepository repository;
    private final SeatMapper seatMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponse> findAll() {
        return seatMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SeatResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(seatMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "seats", key = "#id")
    public SeatResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(seatMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "seats", allEntries = true)
    public SeatResponse create(SeatCreateRequest request) {
        Seat entity = seatMapper.toEntity(request);
        return seatMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "seats", allEntries = true)
    public SeatResponse update(UUID id, SeatUpdateRequest request) {
        Seat entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Seat", id.toString()));
        seatMapper.updateEntityFromRequest(request, entity);
        return seatMapper.toResponse(repository.save(entity));
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
