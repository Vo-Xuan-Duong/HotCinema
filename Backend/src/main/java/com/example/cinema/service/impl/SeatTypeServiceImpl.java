package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.SeatType;
import com.example.cinema.dto.seattype.SeatTypeResponse;
import com.example.cinema.mapper.SeatTypeMapper;
import com.example.cinema.repository.SeatTypeRepository;
import com.example.cinema.service.SeatTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatTypeServiceImpl implements SeatTypeService {

    private final SeatTypeRepository repository;
    private final SeatTypeMapper seatTypeMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SeatTypeResponse> findAll() {
        return seatTypeMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<SeatTypeResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(seatTypeMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "seattypes", key = "#id")
    public Optional<SeatType> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "seattypes", key = "#result.id")
    public SeatType save(SeatType entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "seattypes", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
