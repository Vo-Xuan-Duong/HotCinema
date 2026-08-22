package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Movie;
import com.example.cinema.dto.movie.MovieCreateRequest;
import com.example.cinema.dto.movie.MovieUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.movie.MovieResponse;
import com.example.cinema.mapper.MovieMapper;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.service.MovieService;
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
public class MovieServiceImpl implements MovieService {

    private final MovieRepository repository;
    private final MovieMapper movieMapper;

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> findAll() {
        return movieMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(movieMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movies", key = "#id")
    public MovieResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(movieMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", allEntries = true)
    public MovieResponse create(MovieCreateRequest request) {
        Movie entity = movieMapper.toEntity(request);
        return movieMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", allEntries = true)
    public MovieResponse update(UUID id, MovieUpdateRequest request) {
        Movie entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        movieMapper.updateEntityFromRequest(request, entity);
        return movieMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", key = "#id")
    public void deleteById(UUID id) {
        Movie entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        entity.setActive(false);
        entity.setDeletedAt(ZonedDateTime.now());
        repository.save(entity);
    }
}
