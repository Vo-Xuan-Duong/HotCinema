package com.example.cinema.service.impl;

import com.example.cinema.entity.Movie;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Movie> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Movie> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Movie save(Movie entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
