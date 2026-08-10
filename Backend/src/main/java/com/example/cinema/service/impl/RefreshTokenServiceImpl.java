package com.example.cinema.service.impl;

import com.example.cinema.entity.RefreshToken;
import com.example.cinema.repository.RefreshTokenRepository;
import com.example.cinema.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<RefreshToken> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<RefreshToken> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public RefreshToken save(RefreshToken entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
