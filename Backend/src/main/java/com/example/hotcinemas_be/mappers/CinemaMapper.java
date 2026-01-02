package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.cinema.responses.CinemaResponse;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.services.TheaterService;
import org.springframework.stereotype.Service;

@Service
public class CinemaMapper {
    private final TheaterService theaterService;
    private final RegionMapper regionMapper;

    public CinemaMapper(TheaterService theaterService,
                        RegionMapper regionMapper) {
        this.regionMapper = regionMapper;
        this.theaterService = theaterService;
    }

    public CinemaResponse mapToResponse(Cinema cinema) {
        if (cinema == null) {
            return null;
        }
        return CinemaResponse.builder()
                .id(cinema.getId())
                .name(cinema.getName())
                .address(cinema.getAddress())
                .region(regionMapper.mapToResponse(cinema.getRegion()))
                .latitude(cinema.getLatitude())
                .longitude(cinema.getLongitude())
                .numberOfRooms(theaterService.getNumberRoomsByCinemaId(cinema.getId()))
                .createdAt(cinema.getCreatedAt() != null ? cinema.getCreatedAt().toString() : null)
                .build();
    }
}
