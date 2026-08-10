package com.example.cinema.service;

import com.example.cinema.entity.Notification;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NotificationService {
    List<Notification> findAll();
    Optional<Notification> findById(UUID id);
    Notification save(Notification entity);
    void deleteById(UUID id);
}
