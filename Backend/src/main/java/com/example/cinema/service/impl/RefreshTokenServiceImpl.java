package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.RefreshToken;
import com.example.cinema.dto.refreshtoken.RefreshTokenCreateRequest;
import com.example.cinema.dto.refreshtoken.RefreshTokenUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.refreshtoken.RefreshTokenResponse;
import com.example.cinema.mapper.RefreshTokenMapper;
import com.example.cinema.repository.RefreshTokenRepository;
import com.example.cinema.service.RefreshTokenService;
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
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository repository;
    private final RefreshTokenMapper refreshTokenMapper;

    @Override
    @Transactional(readOnly = true)
    public List<RefreshTokenResponse> findAll() {
        return refreshTokenMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<RefreshTokenResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(refreshTokenMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "refreshtokens", key = "#id")
    public RefreshTokenResponse findById(UUID id) {
        return repository.findById(id)
                .map(refreshTokenMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "refreshtokens", allEntries = true)
    public RefreshTokenResponse create(RefreshTokenCreateRequest request) {
        RefreshToken entity = refreshTokenMapper.toEntity(request);
        return refreshTokenMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "refreshtokens", allEntries = true)
    public RefreshTokenResponse update(UUID id, RefreshTokenUpdateRequest request) {
        RefreshToken entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("RefreshToken", id.toString()));
        refreshTokenMapper.updateEntityFromRequest(request, entity);
        return refreshTokenMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "refreshtokens", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
