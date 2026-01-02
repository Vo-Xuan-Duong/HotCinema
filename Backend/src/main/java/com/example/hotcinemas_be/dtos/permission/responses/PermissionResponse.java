package com.example.hotcinemas_be.dtos.permission.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PermissionResponse {
    private Long id;
    private String name;
    private String description;
    private String module;
    private LocalDateTime createdAt;
}


























