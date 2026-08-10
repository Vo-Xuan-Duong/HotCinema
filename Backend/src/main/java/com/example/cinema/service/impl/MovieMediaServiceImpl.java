package com.example.cinema.service.impl;

import com.example.cinema.entity.MovieMedia;
import com.example.cinema.repository.MovieMediaRepository;
import com.example.cinema.service.MovieMediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovieMediaServiceImpl implements MovieMediaService {

    private final MovieMediaRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<MovieMedia> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MovieMedia> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public MovieMedia save(MovieMedia entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
