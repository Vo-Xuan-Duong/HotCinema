package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Notification;
import com.example.cinema.dto.notification.NotificationCreateRequest;
import com.example.cinema.dto.notification.NotificationUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.notification.NotificationResponse;
import com.example.cinema.mapper.NotificationMapper;
import com.example.cinema.repository.NotificationRepository;
import com.example.cinema.service.NotificationService;
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
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional(readOnly = true)
    public List<NotificationResponse> findAll() {
        return notificationMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<NotificationResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(notificationMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "notifications", key = "#id")
    public NotificationResponse findById(UUID id) {
        return repository.findById(id)
                .map(notificationMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "notifications", allEntries = true)
    public NotificationResponse create(NotificationCreateRequest request) {
        Notification entity = notificationMapper.toEntity(request);
        return notificationMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "notifications", allEntries = true)
    public NotificationResponse update(UUID id, NotificationUpdateRequest request) {
        Notification entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id.toString()));
        notificationMapper.updateEntityFromRequest(request, entity);
        return notificationMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "notifications", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
