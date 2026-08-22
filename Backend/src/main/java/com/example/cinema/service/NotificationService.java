package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Notification;
import com.example.cinema.dto.notification.NotificationResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> findAll();
    PageResponse<NotificationResponse> findPage(Pageable pageable);
    Optional<Notification> findById(UUID id);
    Notification save(Notification entity);
    void deleteById(UUID id);
}
