package com.example.cinema.service.impl;

import com.example.cinema.entity.Genre;
import com.example.cinema.repository.GenreRepository;
import com.example.cinema.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Genre> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Genre> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Genre save(Genre entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
