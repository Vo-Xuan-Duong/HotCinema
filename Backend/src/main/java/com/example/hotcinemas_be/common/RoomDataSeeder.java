package com.example.hotcinemas_be.common;

import com.example.hotcinemas_be.dtos.room.requests.RoomRequest;
import com.example.hotcinemas_be.enums.AudioType;
import com.example.hotcinemas_be.enums.ProjectionType;
import com.example.hotcinemas_be.enums.ScreenFormat;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.repositorys.CinemaRepository;
import com.example.hotcinemas_be.repositorys.RoomRepository;
import com.example.hotcinemas_be.services.RoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RoomDataSeeder implements CommandLineRunner {

    private final CinemaRepository cinemaRepository;
    private final RoomRepository roomRepository;
    private final RoomService roomService;

    @Override
    public void run(String... args) throws Exception {
        List<Cinema> cinemas = cinemaRepository.findAll();
        if (cinemas.isEmpty()) {
            log.info("No cinemas found in the database. Skipping room generation.");
            return;
        }

        log.info("Starting to generate default rooms for cinemas...");

        for (Cinema cinema : cinemas) {
            long roomsInCinema = roomRepository.countRoomByCinema_Id(cinema.getId());
            if (roomsInCinema > 0) {
                log.info("Cinema {} already has rooms. Skipping.", cinema.getName());
                continue;
            }

            // Create Room 1 (Standard 2D)
            RoomRequest room1 = RoomRequest.builder()
                    .cinemaId(cinema.getId())
                    .name("Room 1")
                    .description("Standard 2D Room")
                    .numberRow(8)
                    .numberCol(12)
                    .screenFormat(ScreenFormat.STANDARD)
                    .projectionType(ProjectionType.TWO_D)
                    .audioType(AudioType.STEREO)
                    .isActive(true)
                    .build();
            roomService.createRoom(room1);

            // Create Room 2 (IMAX 3D)
            RoomRequest room2 = RoomRequest.builder()
                    .cinemaId(cinema.getId())
                    .name("Room 2 - IMAX")
                    .description("IMAX 3D Room")
                    .numberRow(12)
                    .numberCol(15)
                    .screenFormat(ScreenFormat.IMAX)
                    .projectionType(ProjectionType.THREE_D)
                    .audioType(AudioType.DOLBY_ATMOS)
                    .isActive(true)
                    .build();
            roomService.createRoom(room2);

            // Create Room 3 (4DX)
            RoomRequest room3 = RoomRequest.builder()
                    .cinemaId(cinema.getId())
                    .name("Room 3 - 4DX")
                    .description("4DX 2D Room")
                    .numberRow(8)
                    .numberCol(10)
                    .screenFormat(ScreenFormat.FOUR_DX)
                    .projectionType(ProjectionType.TWO_D)
                    .audioType(AudioType.SURROUND_5_1)
                    .isActive(true)
                    .build();
            roomService.createRoom(room3);

            log.info("Generated 3 default rooms for cinema: {}", cinema.getName());
        }

        log.info("Finished generating rooms and seats for all cinemas successfully!");
    }
}
