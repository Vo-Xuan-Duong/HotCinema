package com.example.cinema.dto.notification;

import java.util.UUID;

import com.example.cinema.entity.enums.NotificationType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCreateRequest {

    private java.util.UUID userId;
    private NotificationType type;
    private String title;
    private String content;
    private Boolean isRead;
    private ZonedDateTime readAt;
}
