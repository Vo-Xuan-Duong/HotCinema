package com.example.hotcinemas_be.dtos.cinema.responses;

import com.example.hotcinemas_be.dtos.region.response.RegionResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class CinemaResponse {
    private Long id;
    private String name;
    private String address;
    private RegionResponse region;
    private Double latitude;
    private Double longitude;
    private Integer numberOfRooms;
    private String createdAt;
    private String updatedAt;
}

