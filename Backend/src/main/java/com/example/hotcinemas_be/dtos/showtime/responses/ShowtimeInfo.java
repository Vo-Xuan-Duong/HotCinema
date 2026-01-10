package com.example.hotcinemas_be.dtos.showtime.responses;

import com.example.hotcinemas_be.enums.ShowtimeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowtimeInfo {
    private Long showtimeId;
    private LocalTime startTime;
    private LocalTime endTime;
    private Long theaterId;
    private String theaterName;
    private BigDecimal price;
    private Integer totalSeat;
    private Integer usedSeat;
    private ShowtimeStatus status;
}

