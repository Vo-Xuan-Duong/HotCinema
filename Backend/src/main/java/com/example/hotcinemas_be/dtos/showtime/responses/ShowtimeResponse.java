package com.example.hotcinemas_be.dtos.showtime.responses;

import com.example.hotcinemas_be.enums.AudioType;
import com.example.hotcinemas_be.enums.Format;
import com.example.hotcinemas_be.enums.ShowtimeStatus;
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
public class ShowtimeResponse {
    private Long id;
    private String movieTitle;
    private String cinemaName;
    private String roomName;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal price;
    private Format format;
    private String formatLabel;
    private AudioType audioType;
    private String audioTypeLabel;
    private ShowtimeStatus status;
    private Integer totalSeat;
    private Integer usedSeat;
    private Boolean isActive ;
}
