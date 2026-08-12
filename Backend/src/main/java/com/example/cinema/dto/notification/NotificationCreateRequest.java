package com.example.cinema.dto.notification;

import jakarta.validation.constraints.*;

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
    @NotNull
    private NotificationType type;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    @NotNull
    private Boolean isRead;
    @NotNull
    private ZonedDateTime readAt;
}
