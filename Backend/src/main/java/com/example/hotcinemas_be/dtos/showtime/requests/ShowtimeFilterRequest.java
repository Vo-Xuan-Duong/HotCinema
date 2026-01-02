package com.example.hotcinemas_be.dtos.showtime.requests;

import com.example.hotcinemas_be.enums.Format;
import com.example.hotcinemas_be.enums.MovieFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShowtimeFilterRequest {
    private Long movieId;
    private String cinemaAddress;
    private String cinemaCity;
    private Long cinemaId;
    private LocalDate showDate;
    private Format format;
}
