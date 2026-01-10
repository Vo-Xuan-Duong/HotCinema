package com.example.hotcinemas_be.dtos.showtime.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CinemaWithShowtimes {
    private Long cinemaId;
    private String cinemaName;
    private String address;
    private Long cityId;
    private String cityName;
    private Double latitude;
    private Double longitude;
    private Double distance; // Distance in kilometers from user's location (if provided)
    private List<FormatWithShowtimes> formats;
}

