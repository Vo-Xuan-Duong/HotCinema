package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.MovieMedia;
import com.example.cinema.dto.moviemedia.MovieMediaCreateRequest;
import com.example.cinema.dto.moviemedia.MovieMediaUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
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
    public MovieMediaResponse findById(UUID id) {
        return repository.findById(id)
                .map(movieMediaMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("MovieMedia", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", allEntries = true)
    public MovieMediaResponse create(MovieMediaCreateRequest request) {
        MovieMedia entity = movieMediaMapper.toEntity(request);
        return movieMediaMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", allEntries = true)
    public MovieMediaResponse update(UUID id, MovieMediaUpdateRequest request) {
        MovieMedia entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("MovieMedia", id.toString()));
        movieMediaMapper.updateEntityFromRequest(request, entity);
        return movieMediaMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "moviemedias", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
