package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.theater.responses.TheaterResponse;
import org.springframework.stereotype.Service;

@Service
public class RoomMapper {
    public TheaterResponse mapToResponse(Room room) {
        if (room == null) {
            return null;
        }

        return TheaterResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .roomType(room.getRoomType().name()) // Assuming roomType is an enum
                .price(room.getPrice())
                .isActive(room.getIsActive())
                .build();
    }
}
