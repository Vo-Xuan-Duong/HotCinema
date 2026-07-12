package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.theater.responses.TheaterResponse;
import com.example.hotcinemas_be.models.Room;
import org.springframework.stereotype.Service;

@Service
public class TheaterMapper {
    public TheaterResponse mapToResponse(Room room) {
        if (room == null) {
            return null;
        }

        return TheaterResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .theaterType(room.getRoomType().name())
                .totalSeats(room.getTotalSeats())
                .screenType(room.getRoomType().getDisplayName())
                .soundSystem(room.getAudioType().getDisplayName())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
