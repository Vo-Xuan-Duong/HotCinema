package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.notification.NotificationCreateRequest;
import com.example.cinema.dto.notification.NotificationUpdateRequest;
import com.example.cinema.dto.notification.NotificationResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface NotificationService {
    List<NotificationResponse> findAll();
    PageResponse<NotificationResponse> findPage(Pageable pageable);
    NotificationResponse findById(UUID id);
    NotificationResponse create(NotificationCreateRequest request);
    NotificationResponse update(UUID id, NotificationUpdateRequest request);
    void deleteById(UUID id);
}
