package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Genre;
import com.example.cinema.dto.genre.GenreCreateRequest;
import com.example.cinema.dto.genre.GenreUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.genre.GenreResponse;
import com.example.cinema.mapper.GenreMapper;
import com.example.cinema.repository.GenreRepository;
import com.example.cinema.service.GenreService;
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
public class GenreServiceImpl implements GenreService {

    private final GenreRepository repository;
    private final GenreMapper genreMapper;

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> findAll() {
        return genreMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GenreResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(genreMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "genres", key = "#id")
    public GenreResponse findById(UUID id) {
        return repository.findById(id)
                .map(genreMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", allEntries = true)
    public GenreResponse create(GenreCreateRequest request) {
        Genre entity = genreMapper.toEntity(request);
        return genreMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", allEntries = true)
    public GenreResponse update(UUID id, GenreUpdateRequest request) {
        Genre entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Genre", id.toString()));
        genreMapper.updateEntityFromRequest(request, entity);
        return genreMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
