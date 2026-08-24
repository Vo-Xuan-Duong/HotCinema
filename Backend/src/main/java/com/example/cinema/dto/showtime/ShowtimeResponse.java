package com.example.cinema.dto.showtime;

import com.example.cinema.entity.enums.ShowtimeFormat;
import com.example.cinema.entity.enums.ShowtimeStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponse {

    private UUID id;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private UUID movieId;
    private String movieTitle;
    private UUID auditoriumId;
    private UUID roomId;
    private String roomName;
    private UUID cinemaId;
    private String cinemaName;
    private LocalDate showDate;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private String language;
    private String subtitle;
    private ShowtimeFormat format;
    private BigDecimal basePrice;
    private BigDecimal price;
    private ZonedDateTime bookingOpenAt;
    private ZonedDateTime bookingCloseAt;
    private ShowtimeStatus status;
    private UUID createdById;
}
