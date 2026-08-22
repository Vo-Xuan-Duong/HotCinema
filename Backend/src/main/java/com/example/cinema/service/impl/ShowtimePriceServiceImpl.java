package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.ShowtimePrice;
import com.example.cinema.dto.showtimeprice.ShowtimePriceResponse;
import com.example.cinema.mapper.ShowtimePriceMapper;
import com.example.cinema.repository.ShowtimePriceRepository;
import com.example.cinema.service.ShowtimePriceService;
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
public class ShowtimePriceServiceImpl implements ShowtimePriceService {

    private final ShowtimePriceRepository repository;
    private final ShowtimePriceMapper showtimePriceMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimePriceResponse> findAll() {
        return showtimePriceMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShowtimePriceResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(showtimePriceMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimeprices", key = "#id")
    public Optional<ShowtimePrice> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeprices", key = "#result.id")
    public ShowtimePrice save(ShowtimePrice entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeprices", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
