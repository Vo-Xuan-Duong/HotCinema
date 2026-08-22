package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Showtime;
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
import java.util.Optional;
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
    public Optional<Showtime> findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", key = "#result.id")
    public Showtime save(Showtime entity) {
        return repository.save(entity);
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
