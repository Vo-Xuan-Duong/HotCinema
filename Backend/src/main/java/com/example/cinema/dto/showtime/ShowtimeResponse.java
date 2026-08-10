package com.example.cinema.dto.showtime;

import java.util.UUID;

import com.example.cinema.entity.enums.ShowtimeFormat;
import com.example.cinema.entity.enums.ShowtimeStatus;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShowtimeResponse {

    private java.util.UUID id;
    private java.time.ZonedDateTime createdAt;
    private java.time.ZonedDateTime updatedAt;
    private java.util.UUID movieId;
    private java.util.UUID auditoriumId;
    private ZonedDateTime startTime;
    private ZonedDateTime endTime;
    private String language;
    private String subtitle;
    private ShowtimeFormat format;
    private BigDecimal basePrice;
    private ZonedDateTime bookingOpenAt;
    private ZonedDateTime bookingCloseAt;
    private ShowtimeStatus status;
    private java.util.UUID createdById;
}
