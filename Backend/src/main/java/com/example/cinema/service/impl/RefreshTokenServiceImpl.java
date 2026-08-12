package com.example.cinema.service.impl;

import com.example.cinema.entity.RefreshToken;
import com.example.cinema.repository.RefreshTokenRepository;
import com.example.cinema.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<RefreshToken> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "refreshtokens", key = "#id")
    public Optional<RefreshToken> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "refreshtokens", key = "#result.id")
    public RefreshToken save(RefreshToken entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "refreshtokens", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
