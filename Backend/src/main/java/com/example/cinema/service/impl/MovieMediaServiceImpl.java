package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.MovieMedia;
import com.example.cinema.dto.moviemedia.MovieMediaResponse;
import com.example.cinema.mapper.MovieMediaMapper;
import com.example.cinema.repository.MovieMediaRepository;
import com.example.cinema.service.MovieMediaService;
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
public class MovieMediaServiceImpl implements MovieMediaService {

    private final MovieMediaRepository repository;
    private final MovieMediaMapper movieMediaMapper;

    @Override
    @Transactional(readOnly = true)
    public List<MovieMediaResponse> findAll() {
        return movieMediaMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MovieMediaResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(movieMediaMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "moviemedias", key = "#id")
    public Optional<MovieMedia> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", key = "#result.id")
    public MovieMedia save(MovieMedia entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
