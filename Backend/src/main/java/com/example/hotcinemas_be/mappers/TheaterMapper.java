package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.theater.responses.TheaterResponse;
import com.example.hotcinemas_be.models.Theater;
import org.springframework.stereotype.Service;

@Service
public class TheaterMapper {
    public TheaterResponse mapToResponse(Theater theater) {
        if (theater == null) {
            return null;
        }

        return TheaterResponse.builder()
                .id(theater.getId())
                .name(theater.getName())
                .theaterType(theater.getTheaterType().name())
                .totalSeats(theater.getTotalSeats())
                .screenType(theater.getScreenType().getDisplayName())
                .soundSystem(theater.getSoundSystem().getDisplayName())
                .createdAt(theater.getCreatedAt())
                .build();
    }
}
