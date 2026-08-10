package com.example.cinema.dto.employeecinema;

import java.time.ZonedDateTime;
import java.util.UUID;

import com.example.cinema.entity.enums.EmployeePosition;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeCinemaCreateRequest {

    private java.util.UUID userId;
    private java.util.UUID cinemaId;
    private EmployeePosition position;
    private Boolean isActive;
    private ZonedDateTime assignedAt;
    private ZonedDateTime endedAt;
}
