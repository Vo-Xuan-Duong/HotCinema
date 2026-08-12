package com.example.cinema.dto.showtime;

import jakarta.validation.constraints.*;

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
public class ShowtimeCreateRequest {

    private java.util.UUID movieId;
    private java.util.UUID auditoriumId;
    @NotNull
    private ZonedDateTime startTime;
    @NotNull
    private ZonedDateTime endTime;
    @NotBlank
    private String language;
    @NotBlank
    private String subtitle;
    @NotNull
    private ShowtimeFormat format;
    @NotNull
    private BigDecimal basePrice;
    @NotNull
    private ZonedDateTime bookingOpenAt;
    @NotNull
    private ZonedDateTime bookingCloseAt;
    @NotNull
    private ShowtimeStatus status;
    private java.util.UUID createdById;
}
