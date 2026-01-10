package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.theater.requests.TheaterRequest;
import com.example.hotcinemas_be.services.TheaterService;
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

    private final TheaterService theaterService;

    public TheaterController(TheaterService theaterService) {
        this.theaterService = theaterService;
    }

    @Operation(summary = "Get all rooms", description = "Retrieve a list of all rooms in the cinema system")
    @GetMapping
    @PreAuthorize("hasAuthority('THEATER_LIST')")
    public ResponseEntity<?> getAllRooms(Pageable pageable) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully retrieved all rooms")
                .data(theaterService.getPageRooms(pageable))
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
                .data(theaterService.getRoomById(id))
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
                .data(theaterService.getPageRoomsByCinemaId(cinemaId))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Create a new room", description = "Create a new room in the cinema system")
    @PostMapping("/cinema/{cinemaId}")
    public ResponseEntity<?> createRoom(@PathVariable Long cinemaId, @RequestBody TheaterRequest theaterRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(201)
                .message("Successfully created a new room")
                .data(theaterService.createRoom(cinemaId, theaterRequest))
                .build();
        return ResponseEntity.status(201).body(dataResponse);
    }

    @Operation(summary = "Update a room", description = "Update an existing room in the cinema system")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateRoom(@PathVariable Long id, @RequestBody TheaterRequest theaterRequest) {
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully updated room with ID: " + id)
                .data(theaterService.updateRoom(id, theaterRequest))
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Delete a room", description = "Delete a specific room by its ID")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRoom(@PathVariable Long id) {
        theaterService.deleteRoom(id);
        DataResponse<?> dataResponse = DataResponse.builder()
                .status(200)
                .message("Successfully deleted room with ID: " + id)
                .build();
        return ResponseEntity.ok(dataResponse);
    }

    @Operation(summary = "Delete all rooms by cinema ID", description = "Delete all rooms associated with a specific cinema ID")
    @DeleteMapping("/cinema/{cinemaId}")
    public ResponseEntity<?> deleteRoomsByCinemaId(@PathVariable Long cinemaId) {
        theaterService.deleteRoomsByCinemaId(cinemaId);
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
                .data(theaterService.getAllRoomsNoPage())
                .build();
        return ResponseEntity.ok(dataResponse);
    }
}
