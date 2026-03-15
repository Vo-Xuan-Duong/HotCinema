package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.notification.responses.NotificationResponse;
import com.example.hotcinemas_be.services.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notification Management", description = "APIs for managing user notifications")
public class NotificationController {

    private final NotificationService notificationService;

    @Operation(summary = "Get my notifications", description = "Get paginated list of notifications for current user")
    @GetMapping
    public ResponseEntity<DataResponse<Page<NotificationResponse>>> getMyNotifications(
            @PageableDefault(page = 0, size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        return ResponseEntity.ok(DataResponse.<Page<NotificationResponse>>builder()
                .status(200)
                .message("Notifications retrieved successfully")
                .data(notificationService.getMyNotifications(pageable))
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Operation(summary = "Get unread count", description = "Get count of unread notifications")
    @GetMapping("/unread-count")
    public ResponseEntity<DataResponse<Long>> getUnreadCount() {
        return ResponseEntity.ok(DataResponse.<Long>builder()
                .status(200)
                .message("Unread count retrieved successfully")
                .data(notificationService.getUnreadCount())
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Operation(summary = "Mark as read", description = "Mark a specific notification as read")
    @PostMapping("/{id}/read")
    public ResponseEntity<DataResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(DataResponse.<Void>builder()
                .status(200)
                .message("Notification marked as read")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Operation(summary = "Mark all as read", description = "Mark all notifications as read for current user")
    @PostMapping("/read-all")
    public ResponseEntity<DataResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(DataResponse.<Void>builder()
                .status(200)
                .message("All notifications marked as read")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Operation(summary = "Delete notification", description = "Delete a specific notification")
    @DeleteMapping("/{id}")
    public ResponseEntity<DataResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(DataResponse.<Void>builder()
                .status(200)
                .message("Notification deleted successfully")
                .timestamp(LocalDateTime.now())
                .build());
    }
}
