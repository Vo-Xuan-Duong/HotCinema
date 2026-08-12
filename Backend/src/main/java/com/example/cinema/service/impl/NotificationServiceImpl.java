package com.example.cinema.service.impl;

import com.example.cinema.entity.Notification;
import com.example.cinema.repository.NotificationRepository;
import com.example.cinema.service.NotificationService;
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
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "notifications", key = "#id")
    public Optional<Notification> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "notifications", key = "#result.id")
    public Notification save(Notification entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "notifications", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
