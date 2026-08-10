package com.example.cinema.dto.notification;

import com.example.cinema.entity.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationResponse {

    private UUID id;
    private java.util.UUID userId;
    private NotificationType type;
    private String title;
    private String content;
    private Boolean isRead;
    private ZonedDateTime readAt;
    private ZonedDateTime createdAt;
}
