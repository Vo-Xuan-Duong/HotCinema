package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.showtime.requests.ShowtimeRequest;
import com.example.hotcinemas_be.dtos.showtime.requests.ShowtimeFilterRequest;
import com.example.hotcinemas_be.services.ShowtimeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import org.springframework.format.annotation.DateTimeFormat;

@RestController
@RequestMapping("/api/v1/showtime")
@Tag(name = "Showtime Management", description = "APIs for managing showtime in the cinema system")
public class ShowtimeController {
        private final ShowtimeService showtimeService;

        public ShowtimeController(ShowtimeService showtimeService) {
                this.showtimeService = showtimeService;
        }

        @Operation(summary = "Create a new showtime", description = "Creates a new showtime for a movie in a specific cinema hall.")
        @PostMapping()
        @PreAuthorize("hasAuthority('SHOWTIME_CREATE')")
        public ResponseEntity<?> createShowtime(@RequestBody ShowtimeRequest showtimeRequest) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(201)
                                .message("Showtime created successfully")
                                .data(showtimeService.createShowtime(showtimeRequest))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(201).body(dataResponse);
        }

        @Operation(summary = "Get showtime by ID", description = "Retrieves a showtime by its ID.")
        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('SHOWTIME_READ')")
        public ResponseEntity<?> getShowtimeById(@PathVariable Long id) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtime retrieved successfully")
                                .data(showtimeService.getShowtimeById(id))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update showtime by ID", description = "Updates an existing showtime by its ID.")
        @PutMapping("/{id}")
        @PreAuthorize("hasAuthority('SHOWTIME_UPDATE')")
        public ResponseEntity<?> updateShowtime(@PathVariable Long id, @RequestBody ShowtimeRequest showtimeRequest) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtime updated successfully")
                                .data(showtimeService.updateShowtime(id, showtimeRequest))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete showtime by ID", description = "Deletes a showtime by its ID.")
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('SHOWTIME_DELETE')")
        public ResponseEntity<?> deleteShowtime(@PathVariable Long id) {
                showtimeService.deleteShowtime(id);
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtime deleted successfully")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get all showtime", description = "Retrieves all showtime with pagination.")
        @GetMapping
        @PreAuthorize("hasAuthority('SHOWTIME_LIST')")
        public ResponseEntity<?> getAllShowtime(
                        @PageableDefault(page = 0, size = 10, sort = "showDate", direction = Sort.Direction.DESC) Pageable pageable) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtimes retrieved successfully")
                                .data(showtimeService.getAllShowTimes(pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get showtimes with filters", description = "Retrieves showtimes with filters.")
        @GetMapping("/filters")
        public ResponseEntity<?> getShowtimesWithFilters(
                        @RequestBody ShowtimeFilterRequest filterRequest) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtimes retrieved successfully")
                                .data(showtimeService.getShowtimesWithFilters(filterRequest))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get showtimes by movie ID", description = "Retrieves showtimes for a specific movie with pagination.")
        @GetMapping("/movie/{movieId}")
        public ResponseEntity<?> getShowtimesByMovieId(@PathVariable Long movieId, Pageable pageable) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtimes for movie retrieved successfully")
                                .data(showtimeService.getShowtimesByMovieId(movieId, pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get showtime by theater ID", description = "Retrieves showtimes for a specific cinema hall with pagination.")
        @GetMapping("/theater/{theaterId}")
        public ResponseEntity<?> getShowtimeByTheaterId(@PathVariable Long theaterId, Pageable pageable) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtime for theater retrieved successfully")
                                .data(showtimeService.getShowtimesByTheaterId(theaterId, pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete showtime by movie ID", description = "Deletes all showtimes for a specific movie.")
        @DeleteMapping("/movie/{movieId}")
        public ResponseEntity<?> deleteShowtimeByMovieId(@PathVariable Long movieId) {
                showtimeService.deleteShowtimesByMovieId(movieId);
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtime for movie deleted successfully")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete showtime by theater ID", description = "Deletes all showtime for a specific cinema hall.")
        @DeleteMapping("/theater/{theaterId}")
        public ResponseEntity<?> deleteShowtimeByTheaterId(@PathVariable Long theaterId) {
                showtimeService.deleteShowtimesByTheaterId(theaterId);
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtime for theater deleted successfully")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update showtime status", description = "Updates the status of a showtime (e.g., SCHEDULED, ONGOING, COMPLETED, CANCELED).")
        @PutMapping("/{id}/status")
        public ResponseEntity<?> updateShowtimeStatus(@PathVariable Long id, @RequestParam String status) {
                boolean updated = showtimeService.updateShowtimeStatus(id,
                                Enum.valueOf(com.example.hotcinemas_be.enums.ShowtimeStatus.class, status));
                if (updated) {
                        DataResponse<?> dataResponse = DataResponse.builder()
                                        .status(200)
                                        .message("Showtime status updated successfully")
                                        .timestamp(LocalDateTime.now())
                                        .build();
                        return ResponseEntity.ok(dataResponse);
                } else {
                        DataResponse<?> error = DataResponse.builder()
                                        .status(400)
                                        .message("Error updating showtime status: Showtime not found")
                                        .timestamp(LocalDateTime.now())
                                        .build();
                        return ResponseEntity.badRequest().body(error);
                }
        }

        @Operation(summary = "Get cinema showtimes by movie and date", description = "Retrieves cinemas showing a movie on a specific date with pagination. Returns cinemas grouped by formats. "
                        +
                        "Optionally filtered by city or sorted by distance if coordinates are provided.")
        @GetMapping("/movie/{movieId}/date/{date}")
        public ResponseEntity<?> getCinemaShowtimesByMovieAndDate(
                        @PathVariable Long movieId,
                        @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                        @RequestParam(required = false) Long cityId,
                        @RequestParam(required = false) Double latitude,
                        @RequestParam(required = false) Double longitude,
                        @PageableDefault(page = 0, size = 5) Pageable pageable) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Cinema showtimes retrieved successfully")
                                .data(showtimeService.getCinemaShowtimesByMovieAndDate(movieId, date, cityId, latitude,
                                                longitude, pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get showtimes by cinema and date", description = "Retrieves showtimes for a specific cinema on a given date with pagination.")
        @GetMapping("/cinema/{cinemaId}/date/{date}")
        public ResponseEntity<?> getShowtimesByCinemaAndDate(
                        @PathVariable("cinemaId") Long cinemaId,
                        @PathVariable("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
                        @PageableDefault(page = 0, size = 5) Pageable pageable) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Showtimes retrieved successfully")
                                .data(showtimeService.getShowtimesByCinemaAndDate(cinemaId, date, pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get seats by showtime ID", description = "Retrieves all seats for a specific showtime.")
        @GetMapping("/{showtimeId}/seats")
        public ResponseEntity<?> getSeatsByShowtimeId(@PathVariable Long showtimeId) {
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Seats retrieved successfully for showtime ID: " + showtimeId)
                                .data(showtimeService.getSeatsByShowtimeId(showtimeId))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @PostMapping("/{showtimeId}/lock-seat/{seatId}")
        public ResponseEntity<?> lockSeat(
                        @PathVariable Long showtimeId,
                        @PathVariable Long seatId,
                        @RequestParam(name = "userId") Long userId) {
                showtimeService.lockSeatForShowtime(showtimeId, seatId, userId != null ? userId : 0L);
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Seat locked successfully")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @PostMapping("/{showtimeId}/unlock-seat/{seatId}")
        public ResponseEntity<?> unlockSeat(
                        @PathVariable Long showtimeId,
                        @PathVariable Long seatId) {
                showtimeService.unlockSeatForShowtime(showtimeId, seatId);
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(200)
                                .message("Seat unlocked successfully")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }
}
