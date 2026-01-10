package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.booking.requests.BookingRequest;
import com.example.hotcinemas_be.dtos.booking.responses.BookingResponse;
import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.enums.BookingStatus;
import com.example.hotcinemas_be.services.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/bookings")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Booking Management", description = "APIs for managing bookings in the cinema system")
public class BookingController {

        private final BookingService bookingService;

        @Operation(summary = "Create a new booking", description = "This endpoint allows users to create a new booking for a showtime.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Booking created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "404", description = "Showtime or seats not found"),
                        @ApiResponse(responseCode = "409", description = "Seats already booked")
        })
        @PostMapping
        public ResponseEntity<DataResponse<BookingResponse>> createBooking(
                        @Valid @RequestBody BookingRequest bookingRequest) {

                log.info("Creating new booking for showtime: {} with seats: {}",
                                bookingRequest.getShowtimeId(), bookingRequest.getShowtimeId());
                BookingResponse bookingResponse = bookingService.createBooking(bookingRequest);

                DataResponse<BookingResponse> dataResponse = DataResponse.<BookingResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("Booking has been successfully created")
                                .data(bookingResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.CREATED).body(dataResponse);

        }

        @Operation(summary = "Get booking by ID", description = "This endpoint retrieves a booking by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Booking found"),
                        @ApiResponse(responseCode = "404", description = "Booking not found")
        })
        @GetMapping("/{id}")
        public ResponseEntity<DataResponse<BookingResponse>> getBookingById(
                        @Parameter(description = "Booking ID") @PathVariable Long id) {
                log.info("Retrieving booking with ID: {}", id);
                BookingResponse booking = bookingService.getBookingById(id);

                DataResponse<BookingResponse> dataResponse = DataResponse.<BookingResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Booking retrieved successfully")
                                .data(booking)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get booking by booking code", description = "This endpoint retrieves a booking by its booking code.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Booking found"),
                        @ApiResponse(responseCode = "404", description = "Booking not found")
        })
        @GetMapping("/code/{bookingCode}")
        public ResponseEntity<DataResponse<BookingResponse>> getBookingByCode(
                        @Parameter(description = "Booking code") @PathVariable String bookingCode) {
                log.info("Retrieving booking with code: {}", bookingCode);
                BookingResponse booking = bookingService.getBookingByCode(bookingCode);

                DataResponse<BookingResponse> dataResponse = DataResponse.<BookingResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Booking retrieved successfully")
                                .data(booking)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get bookings by user ID", description = "This endpoint retrieves all bookings for a specific user.")
        @GetMapping("/user/{userId}")
        public ResponseEntity<DataResponse<List<BookingResponse>>> getBookingsByUserId(
                        @Parameter(description = "User ID") @PathVariable Long userId) {
                log.info("Retrieving bookings for user ID: {}", userId);
                List<BookingResponse> bookings = bookingService.getBookingsByUserId(userId);

                DataResponse<List<BookingResponse>> dataResponse = DataResponse.<List<BookingResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("User bookings retrieved successfully")
                                .data(bookings)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get bookings by showtime ID", description = "This endpoint retrieves all bookings for a specific showtime.")
        @GetMapping("/showtime/{showtimeId}")
        public ResponseEntity<DataResponse<List<BookingResponse>>> getBookingsByShowtimeId(
                        @Parameter(description = "Showtime ID") @PathVariable Long showtimeId) {
                log.info("Retrieving bookings for showtime ID: {}", showtimeId);
                List<BookingResponse> bookings = bookingService.getBookingsByShowtimeId(showtimeId);

                DataResponse<List<BookingResponse>> dataResponse = DataResponse.<List<BookingResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Showtime bookings retrieved successfully")
                                .data(bookings)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get bookings by status", description = "This endpoint retrieves all bookings with a specific status.")
        @GetMapping("/status/{status}")
        public ResponseEntity<DataResponse<List<BookingResponse>>> getBookingsByStatus(
                        @Parameter(description = "Booking status") @PathVariable BookingStatus status) {
                log.info("Retrieving bookings with status: {}", status);
                List<BookingResponse> bookings = bookingService.getBookingsByStatus(status);

                DataResponse<List<BookingResponse>> dataResponse = DataResponse.<List<BookingResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Bookings with status retrieved successfully")
                                .data(bookings)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get all bookings with pagination", description = "This endpoint retrieves all bookings with pagination.")
        @GetMapping
        public ResponseEntity<DataResponse<Page<?>>> getAllBookings(
                        @Parameter(description = "Pagination parameters") Pageable pageable) {
                log.info("Retrieving all bookings with pagination");
                DataResponse<Page<?>> dataResponse = DataResponse.<Page<?>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Bookings retrieved successfully")
                                .data(bookingService.getAllBookings(pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update booking status", description = "This endpoint allows updating the status of a booking.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Booking status updated successfully"),
                        @ApiResponse(responseCode = "404", description = "Booking not found"),
                        @ApiResponse(responseCode = "400", description = "Invalid status transition")
        })
        @PatchMapping("/{id}/status")
        @PreAuthorize("hasAuthority('BOOKING_UPDATE_STATUS')")
        public ResponseEntity<DataResponse<BookingResponse>> updateBookingStatus(
                        @Parameter(description = "Booking ID") @PathVariable Long id,
                        @RequestParam BookingStatus status) {
                log.info("Updating booking {} status to {}", id, status);
                BookingResponse booking = bookingService.updateBookingStatus(id, status);

                DataResponse<BookingResponse> dataResponse = DataResponse.<BookingResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Booking status updated successfully")
                                .data(booking)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete booking", description = "This endpoint allows deleting a booking by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Booking deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "Booking not found")
        })
        @DeleteMapping("/{id}")
        @PreAuthorize("hasAuthority('BOOKING_DELETE')")
        public ResponseEntity<DataResponse<Void>> deleteBooking(
                        @Parameter(description = "Booking ID") @PathVariable Long id) {
                log.info("Deleting booking with ID: {}", id);
                bookingService.deleteBooking(id);

                DataResponse<Void> dataResponse = DataResponse.<Void>builder()
                                .status(HttpStatus.OK.value())
                                .message("Booking has been successfully deleted")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @GetMapping("/history/user/{userId}")
        @PreAuthorize("hasAuthority('BOOKING_MY_BOOKINGS')")
        public ResponseEntity<?> getBookingHistoryByUserId(
                        @Parameter(description = "User ID") @PathVariable Long userId,
                        @PageableDefault(size = 5, page = 0) Pageable pageable) {
                log.info("Retrieving booking history for user ID: {}", userId);
                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(HttpStatus.OK.value())
                                .message("Booking history retrieved successfully")
                                .data(bookingService.getBookingHistoryByUserId(userId, pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

}
