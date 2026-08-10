package com.example.cinema.dto.auditorium;

import java.util.UUID;

import com.example.cinema.entity.enums.AuditoriumStatus;
import com.example.cinema.entity.enums.ScreenType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriumCreateRequest {

    private java.util.UUID cinemaId;
    private String code;
    private String name;
    private ScreenType screenType;
    private Integer totalRows;
    private Integer totalColumns;
    private Integer capacity;
    private AuditoriumStatus status;
}
