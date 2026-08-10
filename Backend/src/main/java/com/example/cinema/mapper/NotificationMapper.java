package com.example.cinema.mapper;

import com.example.cinema.dto.notification.NotificationCreateRequest;
import com.example.cinema.dto.notification.NotificationUpdateRequest;
import com.example.cinema.dto.notification.NotificationResponse;
import com.example.cinema.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface NotificationMapper {

    Notification toEntity(NotificationCreateRequest request);

    NotificationResponse toResponse(Notification entity);

    List<NotificationResponse> toResponseList(List<Notification> entities);

    void updateEntityFromRequest(NotificationUpdateRequest request, @MappingTarget Notification entity);
}
