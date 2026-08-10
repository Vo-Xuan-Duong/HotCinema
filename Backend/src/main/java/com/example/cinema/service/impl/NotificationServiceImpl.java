package com.example.cinema.service.impl;

import com.example.cinema.entity.Notification;
import com.example.cinema.repository.NotificationRepository;
import com.example.cinema.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<Notification> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Notification> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public Notification save(Notification entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
