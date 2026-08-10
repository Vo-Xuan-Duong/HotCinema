package com.example.cinema.service.impl;

import com.example.cinema.entity.BookingSeat;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.service.BookingSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingSeatServiceImpl implements BookingSeatService {

    private final BookingSeatRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingSeat> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<BookingSeat> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public BookingSeat save(BookingSeat entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
