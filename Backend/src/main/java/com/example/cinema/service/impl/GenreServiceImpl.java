package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Genre;
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
import java.util.Optional;
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
    public Optional<Genre> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", key = "#result.id")
    public Genre save(Genre entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "genres", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
