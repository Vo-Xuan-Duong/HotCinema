package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.seat.requests.SeatRequest;
import com.example.hotcinemas_be.dtos.seat.responses.SeatResponse;
import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import com.example.hotcinemas_be.services.SeatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/seats")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Seat Management", description = "APIs for managing seats")
public class SeatController {

        private final SeatService seatService;

        @Operation(summary = "Create a new seat", description = "This endpoint allows creating a new seat in a theater.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Seat created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "404", description = "theater not found"),
                        @ApiResponse(responseCode = "409", description = "Seat already exists at this position")
        })
        @PostMapping
        public ResponseEntity<DataResponse<SeatResponse>> createSeat(
                        @Valid @RequestBody SeatRequest seatRequest) {
                log.info("Creating new seat at position {} in theater {}",
                                seatRequest.getName(), seatRequest.getTheaterId());
                SeatResponse seatResponse = seatService.createSeat(seatRequest);

                DataResponse<SeatResponse> dataResponse = DataResponse.<SeatResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("Seat has been successfully created")
                                .data(seatResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.CREATED).body(dataResponse);
        }

        @Operation(summary = "Get a seat by ID", description = "This endpoint retrieves a seat by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Seat found"),
                        @ApiResponse(responseCode = "404", description = "Seat not found")
        })
        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('SEAT_READ')")
        public ResponseEntity<DataResponse<SeatResponse>> getSeatById(
                        @Parameter(description = "Seat ID") @PathVariable Long id) {
                log.info("Retrieving seat with ID: {}", id);
                SeatResponse seat = seatService.getSeatById(id);

                DataResponse<SeatResponse> dataResponse = DataResponse.<SeatResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seat retrieved successfully")
                                .data(seat)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get seats by theater ID", description = "This endpoint retrieves all seats for a specific theater.")
        @GetMapping("/theater/{theaterId}")
        @PreAuthorize("hasAuthority('SEAT_LIST')")
        public ResponseEntity<DataResponse<List<SeatResponse>>> getSeatsByTheaterId(
                        @Parameter(description = "theater ID") @PathVariable Long theaterId) {
                log.info("Retrieving seats for theater ID: {}", theaterId);
                List<SeatResponse> seats = seatService.getSeatsByTheaterId(theaterId);

                DataResponse<List<SeatResponse>> dataResponse = DataResponse.<List<SeatResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seats for theater retrieved successfully")
                                .data(seats)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get active seats by theater ID", description = "This endpoint retrieves all active seats for a specific theater.")
        @GetMapping("/theater/{theaterId}/active")
        @PreAuthorize("hasAuthority('SEAT_LIST')")
        public ResponseEntity<DataResponse<List<SeatResponse>>> getActiveSeatsByTheaterId(
                        @Parameter(description = "theater ID") @PathVariable Long theaterId) {
                log.info("Retrieving active seats for theater ID: {}", theaterId);
                List<SeatResponse> seats = seatService.getSeatsByTheaterIdAndActive(theaterId);

                DataResponse<List<SeatResponse>> dataResponse = DataResponse.<List<SeatResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Active seats for theater retrieved successfully")
                                .data(seats)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get seats by seat type", description = "This endpoint retrieves all seats with a specific seat type.")
        @GetMapping("/type/{seatType}")
        public ResponseEntity<DataResponse<List<SeatResponse>>> getSeatsBySeatType(
                        @Parameter(description = "Seat type") @PathVariable SeatType seatType) {
                log.info("Retrieving seats with type: {}", seatType);
                List<SeatResponse> seats = seatService.getSeatsBySeatType(seatType);

                DataResponse<List<SeatResponse>> dataResponse = DataResponse.<List<SeatResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seats with type retrieved successfully")
                                .data(seats)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get seats by theater ID and seat type", description = "This endpoint retrieves seats for a specific theater and seat type.")
        @GetMapping("/theater/{theaterId}/type/{seatType}")
        public ResponseEntity<DataResponse<List<SeatResponse>>> getSeatsByTheaterIdAndSeatType(
                        @Parameter(description = "theater ID") @PathVariable Long theaterId,
                        @Parameter(description = "Seat type") @PathVariable SeatType seatType) {
                log.info("Retrieving seats for theater {} with type {}", theaterId, seatType);
                List<SeatResponse> seats = seatService.getSeatsByTheaterIdAndSeatType(theaterId, seatType);

                DataResponse<List<SeatResponse>> dataResponse = DataResponse.<List<SeatResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seats for theater and type retrieved successfully")
                                .data(seats)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get seats by cinema ID", description = "This endpoint retrieves all seats for a specific cinema.")
        @GetMapping("/cinema/{cinemaId}")
        public ResponseEntity<DataResponse<List<SeatResponse>>> getSeatsByCinemaId(
                        @Parameter(description = "Cinema ID") @PathVariable Long cinemaId) {
                log.info("Retrieving seats for cinema ID: {}", cinemaId);
                List<SeatResponse> seats = seatService.getSeatsByCinemaId(cinemaId);

                DataResponse<List<SeatResponse>> dataResponse = DataResponse.<List<SeatResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seats for cinema retrieved successfully")
                                .data(seats)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update a seat", description = "This endpoint allows updating an existing seat.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Seat updated successfully"),
                        @ApiResponse(responseCode = "404", description = "Seat not found"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data")
        })
        @PutMapping("/{id}")
        public ResponseEntity<DataResponse<SeatResponse>> updateSeat(
                        @Parameter(description = "Seat ID") @PathVariable Long id,
                        @Valid @RequestBody SeatRequest seatRequest) {
                log.info("Updating seat with ID: {}", id);
                SeatResponse seatResponse = seatService.updateSeat(id, seatRequest);

                DataResponse<SeatResponse> dataResponse = DataResponse.<SeatResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seat has been successfully updated")
                                .data(seatResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Partially update a seat", description = "This endpoint allows partially updating an existing seat.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Seat partially updated successfully"),
                        @ApiResponse(responseCode = "404", description = "Seat not found"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data")
        })
        @PatchMapping("/{id}")
        public ResponseEntity<DataResponse<SeatResponse>> partialUpdateSeat(
                        @Parameter(description = "Seat ID") @PathVariable Long id,
                        @RequestBody SeatRequest seatRequest) {
                log.info("Partially updating seat with ID: {}", id);
                SeatResponse seatResponse = seatService.updateSeat(id, seatRequest);

                DataResponse<SeatResponse> dataResponse = DataResponse.<SeatResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seat has been partially updated")
                                .data(seatResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @PatchMapping("/{id}/status")
        public ResponseEntity<DataResponse<SeatResponse>> updateSeatStatus(
                        @Parameter(description = "Seat ID") @PathVariable Long id,
                        @RequestParam SeatStatus status) {
                log.info("Updating status of seat with ID: {} to {}", id, status);
                seatService.changeStatusSeat(id, status);
                DataResponse<SeatResponse> dataResponse = DataResponse.<SeatResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seat status has been successfully updated")
                                .data(null)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete a seat", description = "This endpoint allows deleting a seat by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Seat deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "Seat not found")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<DataResponse<Void>> deleteSeat(
                        @Parameter(description = "Seat ID") @PathVariable Long id) {
                log.info("Deleting seat with ID: {}", id);
                seatService.deleteSeat(id);

                DataResponse<Void> dataResponse = DataResponse.<Void>builder()
                                .status(HttpStatus.OK.value())
                                .message("Seat has been successfully deleted")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Create seats for theater", description = "This endpoint creates multiple seats for a theater.")
        @PostMapping("/theater/{theaterId}/create-bulk")
        public ResponseEntity<DataResponse<Void>> createSeatsForTheater(
                        @Parameter(description = "theater ID") @PathVariable Long theaterId,
                        @RequestParam Integer rowsCount,
                        @RequestParam Integer seatsPerRow) {
                log.info("Creating {} rows x {} seats for theater {}", rowsCount, seatsPerRow, theaterId);
                seatService.createSeatsForTheater(theaterId, rowsCount, seatsPerRow);

                DataResponse<Void> dataResponse = DataResponse.<Void>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("Seats have been successfully created for theater")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.CREATED).body(dataResponse);
        }

        @Operation(summary = "Delete all seats by theater ID", description = "This endpoint deletes all seats for a specific theater.")
        @DeleteMapping("/theater/{theaterId}")
        public ResponseEntity<DataResponse<Void>> deleteSeatsByTheaterId(
                        @Parameter(description = "theater ID") @PathVariable Long theaterId) {
                log.info("Deleting all seats for theater ID: {}", theaterId);
                seatService.deleteSeatsByTheaterId(theaterId);

                DataResponse<Void> dataResponse = DataResponse.<Void>builder()
                                .status(HttpStatus.OK.value())
                                .message("All seats for theater have been successfully deleted")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }
}
