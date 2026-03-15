package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.notification.responses.NotificationResponse;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.models.Notification;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.NotificationRepository;
import com.example.hotcinemas_be.repositorys.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AppException("User not found", ErrorCode.USER_NOT_FOUND));
    }

    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        User user = getCurrentUser();
        return notificationRepository.findByUserId(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    public long getUnreadCount() {
        User user = getCurrentUser();
        return notificationRepository.findByUserIdAndIsReadFalse(user.getId()).size();
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException("Notification not found", ErrorCode.MODEL_NOT_FOUND));

        User user = getCurrentUser();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized", ErrorCode.UNAUTHORIZED);
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead() {
        User user = getCurrentUser();
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(user.getId());
        unreadNotifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Transactional
    public void deleteNotification(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException("Notification not found", ErrorCode.MODEL_NOT_FOUND));

        User user = getCurrentUser();
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AppException("Unauthorized", ErrorCode.UNAUTHORIZED);
        }

        notificationRepository.delete(notification);
    }

    @Transactional
    public void createNotification(User user, String title, String message, String type) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .isRead(false)
                .build();
        notificationRepository.save(notification);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
