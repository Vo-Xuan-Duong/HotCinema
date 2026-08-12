package com.example.cinema.service;

import com.example.cinema.entity.Notification;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface NotificationService {
    Page<Notification> findAll(Pageable pageable);
    Optional<Notification> findById(UUID id);
    Notification save(Notification entity);
    void deleteById(UUID id);
}
