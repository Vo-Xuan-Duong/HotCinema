package com.example.cinema.controller;

import com.example.cinema.entity.Notification;
import com.example.cinema.service.NotificationService;
import com.example.cinema.common.response.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import com.example.cinema.mapper.NotificationMapper;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.notification.NotificationCreateRequest;
import com.example.cinema.dto.notification.NotificationUpdateRequest;
import com.example.cinema.dto.notification.NotificationResponse;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import com.example.cinema.common.response.PageResponse;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;

    public NotificationController(NotificationService notificationService, NotificationMapper notificationMapper) {
        this.notificationService = notificationService;
        this.notificationMapper = notificationMapper;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(notificationService.findAll()));
    }

    @GetMapping("/page")
    public ResponseEntity<ApiResponse<PageResponse<NotificationResponse>>> getPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(new ApiResponse<>(notificationService.findPage(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> getById(@PathVariable UUID id) {
        NotificationResponse res = notificationService.findById(id)
                .map(notificationMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id.toString()));
        return ResponseEntity.ok(new ApiResponse<>(res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<NotificationResponse>> create(@Valid @RequestBody NotificationCreateRequest request) {
        Notification entity = notificationMapper.toEntity(request);
        Notification saved = notificationService.save(entity);
        return ResponseEntity.ok(new ApiResponse<>(notificationMapper.toResponse(saved)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NotificationResponse>> update(@PathVariable UUID id, @Valid @RequestBody NotificationUpdateRequest request) {
        Notification existing = notificationService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id.toString()));
        notificationMapper.updateEntityFromRequest(request, existing);
        Notification saved = notificationService.save(existing);
        return ResponseEntity.ok(new ApiResponse<>(notificationMapper.toResponse(saved)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        notificationService.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification", id.toString()));
        notificationService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
