package com.example.cinema.dto.auditorium;

import jakarta.validation.constraints.*;

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
    @NotBlank
    private String code;
    @NotBlank
    private String name;
    @NotNull
    private ScreenType screenType;
    @NotNull
    private Integer totalRows;
    @NotNull
    private Integer totalColumns;
    @NotNull
    private Integer capacity;
    @NotNull
    private AuditoriumStatus status;
}
