package com.example.hotcinemas_be.dtos.showtime.requests;

import com.example.hotcinemas_be.enums.AudioType;
import com.example.hotcinemas_be.enums.Format;
import com.example.hotcinemas_be.enums.ShowtimeStatus;
import com.example.hotcinemas_be.models.Movie;
import com.example.hotcinemas_be.models.Theater;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowtimeRequest {
    private Long movieId;
    private Long theaterId;
    private Format format;
    private AudioType audioType;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal basePrice;
    private ShowtimeStatus status;
}
