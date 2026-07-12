package com.example.hotcinemas_be.dtos.theater.responses;

import com.example.hotcinemas_be.enums.AudioType;
import com.example.hotcinemas_be.enums.RoomStatus;
import com.example.hotcinemas_be.enums.RoomType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class RoomResponse {
    private Long id;
    private String name;
    private String description;
    private Integer totalSeats;
    private RoomType roomType;
    private AudioType audioType;
    private RoomStatus roomStatus;
}

