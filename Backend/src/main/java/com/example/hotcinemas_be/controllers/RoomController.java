package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.common.DataResponse;
import com.example.hotcinemas_be.dtos.room.requests.RoomRequest;
import com.example.hotcinemas_be.services.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
@Tag(name = "Room Management", description = "APIs for managing rooms in the cinema system")
public class TheaterController {

    private final RoomService roomService;

    public TheaterController(RoomService roomService) {
        this.roomService = roomService;
    }

    @Operation(summary = "Get all rooms", description = "Retrieve a list of all rooms in the cinema system")
    @GetMapping
    @PreAuthorize("hasAuthority('THEATER_LIST')")
    public ResponseEntity<?> getAllRooms(Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully retrieved all rooms")
                .data(roomService.getPageRooms(pageable))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get room by ID", description = "Retrieve a specific room by its ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('THEATER_READ')")
    public ResponseEntity<?> getRoomById(@PathVariable Long id) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully retrieved room with ID: " + id)
                .data(roomService.getRoomById(id))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Get rooms by cinema ID", description = "Retrieve all rooms associated with a specific cinema ID")
    @GetMapping("/cinema/{cinemaId}")
    @PreAuthorize("hasAuthority('THEATER_LIST')")
    public ResponseEntity<?> getRoomsByCinemaId(@PathVariable Long cinemaId) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully retrieved rooms for cinema ID: " + cinemaId)
                .data(roomService.getPageRoomsByCinemaId(cinemaId))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Create a new room", description = "Create a new room in the cinema system")
    @PostMapping("/cinema/{cinemaId}")
    public ResponseEntity<?> createRoom(@PathVariable Long cinemaId, @RequestBody RoomRequest roomRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(201)
                .message("Successfully created a new room")
                .data(roomService.createRoom(cinemaId, roomRequest))
                .build();
        return ResponseEntity.status(201).body(dataResponse);
    }

    @Operation(summary = "Update a room", description = "Update an existing room in the cinema system")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody RoomRequest roomRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully updated room with ID: " + id)
                .data(roomService.updateRoom(id, roomRequest))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Delete a room", description = "Delete a specific room by its ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        roomService.deleteRoom(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully deleted room with ID: " + id)
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Delete all rooms by cinema ID", description = "Delete all rooms associated with a specific cinema ID")
    @DeleteMapping("/cinema/{cinemaId}")
    public ResponseEntity<?> deleteRoomsByCinemaId(@PathVariable Long cinemaId) {
        roomService.deleteRoomsByCinemaId(cinemaId);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully deleted all rooms for cinema ID: " + cinemaId)
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @GetMapping("/all-no-page")
    public ResponseEntity<?> getAllRoomsNoPage() {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully retrieved all rooms without pagination")
                .data(roomService.getAllRoomsNoPage())
                .build();
        return ResponseEntity.ok(dataResponse);
    }
}
