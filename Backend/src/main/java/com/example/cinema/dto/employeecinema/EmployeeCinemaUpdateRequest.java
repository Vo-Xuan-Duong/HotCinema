package com.example.cinema.dto.employeecinema;

import jakarta.validation.constraints.*;

import java.util.UUID;

import com.example.cinema.entity.enums.EmployeePosition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCinemaUpdateRequest {

    private java.util.UUID userId;
    private java.util.UUID cinemaId;
    @NotNull
    private EmployeePosition position;
    @NotNull
    private Boolean isActive;
    @NotNull
    private ZonedDateTime assignedAt;
    @NotNull
    private ZonedDateTime endedAt;
}
