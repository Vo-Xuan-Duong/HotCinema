package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.revenue.requests.RevenueFilterRequest;
import com.example.hotcinemas_be.dtos.revenue.responses.*;
import com.example.hotcinemas_be.services.RevenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/revenue")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Revenue Statistics", description = "APIs for revenue statistics and analytics")
public class RevenueController {

        private final RevenueService revenueService;

        @Operation(summary = "Get revenue summary", description = "Get a comprehensive revenue summary for a date range")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Revenue summary retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid date parameters")
        })
        @GetMapping("/summary")
        public ResponseEntity<DataResponse<RevenueSummaryResponse>> getRevenueSummary(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                // Default to last 30 days if dates not provided
                if (startDate == null) {
                        startDate = LocalDate.now().minusDays(30);
                }
                if (endDate == null) {
                        endDate = LocalDate.now();
                }

                log.info("Getting revenue summary from {} to {}", startDate, endDate);
                RevenueSummaryResponse summary = revenueService.getRevenueSummary(startDate, endDate);

                DataResponse<RevenueSummaryResponse> dataResponse = DataResponse.<RevenueSummaryResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Revenue summary retrieved successfully")
                                .data(summary)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get revenue by date", description = "Get daily revenue breakdown for a date range")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Revenue by date retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid date parameters")
        })
        @GetMapping("/by-date")
        @PreAuthorize("hasAuthority('REVENUE_VIEW')")
        public ResponseEntity<DataResponse<List<RevenueByDateResponse>>> getRevenueByDate(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                // Default to last 30 days if dates not provided
                if (startDate == null) {
                        startDate = LocalDate.now().minusDays(30);
                }
                if (endDate == null) {
                        endDate = LocalDate.now();
                }

                log.info("Getting revenue by date from {} to {}", startDate, endDate);
                List<RevenueByDateResponse> revenueByDate = revenueService.getRevenueByDate(startDate, endDate);

                DataResponse<List<RevenueByDateResponse>> dataResponse = DataResponse
                                .<List<RevenueByDateResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Revenue by date retrieved successfully")
                                .data(revenueByDate)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get revenue by movie", description = "Get revenue breakdown by movie with optional filters")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Revenue by movie retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid parameters")
        })
        @GetMapping("/by-movie")
        @PreAuthorize("hasAuthority('REVENUE_VIEW')")
        public ResponseEntity<DataResponse<List<RevenueByMovieResponse>>> getRevenueByMovie(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @Parameter(description = "Cinema ID filter") @RequestParam(required = false) Long cinemaId,
                        @Parameter(description = "Cinema Cluster ID filter") @RequestParam(required = false) Long cinemaClusterId,
                        @Parameter(description = "Limit results") @RequestParam(required = false, defaultValue = "0") int limit) {
                RevenueFilterRequest filter = RevenueFilterRequest.builder()
                                .startDate(startDate != null ? startDate : LocalDate.now().minusDays(30))
                                .endDate(endDate != null ? endDate : LocalDate.now())
                                .cinemaId(cinemaId)
                                .cinemaClusterId(cinemaClusterId)
                                .build();

                log.info("Getting revenue by movie with filter: {}", filter);
                List<RevenueByMovieResponse> revenueByMovie = revenueService.getRevenueByMovie(filter, limit);

                DataResponse<List<RevenueByMovieResponse>> dataResponse = DataResponse
                                .<List<RevenueByMovieResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Revenue by movie retrieved successfully")
                                .data(revenueByMovie)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get revenue by cinema", description = "Get revenue breakdown by cinema with optional filters")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Revenue by cinema retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid parameters")
        })
        @GetMapping("/by-cinema")
        @PreAuthorize("hasAuthority('REVENUE_VIEW')")
        public ResponseEntity<DataResponse<List<RevenueByCinemaResponse>>> getRevenueByCinema(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @Parameter(description = "Movie ID filter") @RequestParam(required = false) Long movieId,
                        @Parameter(description = "Cinema Cluster ID filter") @RequestParam(required = false) Long cinemaClusterId,
                        @Parameter(description = "Limit results") @RequestParam(required = false, defaultValue = "0") int limit) {
                RevenueFilterRequest filter = RevenueFilterRequest.builder()
                                .startDate(startDate != null ? startDate : LocalDate.now().minusDays(30))
                                .endDate(endDate != null ? endDate : LocalDate.now())
                                .movieId(movieId)
                                .cinemaClusterId(cinemaClusterId)
                                .build();

                log.info("Getting revenue by cinema with filter: {}", filter);
                List<RevenueByCinemaResponse> revenueByCinema = revenueService.getRevenueByCinema(filter, limit);

                DataResponse<List<RevenueByCinemaResponse>> dataResponse = DataResponse
                                .<List<RevenueByCinemaResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Revenue by cinema retrieved successfully")
                                .data(revenueByCinema)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get revenue by payment method", description = "Get revenue breakdown by payment method")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Revenue by payment method retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid date parameters")
        })
        @GetMapping("/by-payment-method")
        public ResponseEntity<DataResponse<List<RevenueByPaymentMethodResponse>>> getRevenueByPaymentMethod(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
                // Default to last 30 days if dates not provided
                if (startDate == null) {
                        startDate = LocalDate.now().minusDays(30);
                }
                if (endDate == null) {
                        endDate = LocalDate.now();
                }

                log.info("Getting revenue by payment method from {} to {}", startDate, endDate);
                List<RevenueByPaymentMethodResponse> revenueByPaymentMethod = revenueService
                                .getRevenueByPaymentMethod(startDate, endDate);

                DataResponse<List<RevenueByPaymentMethodResponse>> dataResponse = DataResponse
                                .<List<RevenueByPaymentMethodResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Revenue by payment method retrieved successfully")
                                .data(revenueByPaymentMethod)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get top movies by revenue", description = "Get top performing movies by revenue")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Top movies retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid parameters")
        })
        @GetMapping("/top-movies")
        public ResponseEntity<DataResponse<List<RevenueByMovieResponse>>> getTopMoviesByRevenue(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @Parameter(description = "Number of top movies to return") @RequestParam(required = false, defaultValue = "10") int limit) {
                // Default to last 30 days if dates not provided
                if (startDate == null) {
                        startDate = LocalDate.now().minusDays(30);
                }
                if (endDate == null) {
                        endDate = LocalDate.now();
                }

                log.info("Getting top {} movies by revenue from {} to {}", limit, startDate, endDate);
                List<RevenueByMovieResponse> topMovies = revenueService.getTopMoviesByRevenue(startDate, endDate,
                                limit);

                DataResponse<List<RevenueByMovieResponse>> dataResponse = DataResponse
                                .<List<RevenueByMovieResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Top movies by revenue retrieved successfully")
                                .data(topMovies)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get top cinemas by revenue", description = "Get top performing cinemas by revenue")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Top cinemas retrieved successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid parameters")
        })
        @GetMapping("/top-cinemas")
        public ResponseEntity<DataResponse<List<RevenueByCinemaResponse>>> getTopCinemasByRevenue(
                        @Parameter(description = "Start date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
                        @Parameter(description = "End date (YYYY-MM-DD)") @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
                        @Parameter(description = "Number of top cinemas to return") @RequestParam(required = false, defaultValue = "10") int limit) {
                // Default to last 30 days if dates not provided
                if (startDate == null) {
                        startDate = LocalDate.now().minusDays(30);
                }
                if (endDate == null) {
                        endDate = LocalDate.now();
                }

                log.info("Getting top {} cinemas by revenue from {} to {}", limit, startDate, endDate);
                List<RevenueByCinemaResponse> topCinemas = revenueService.getTopCinemasByRevenue(startDate, endDate,
                                limit);

                DataResponse<List<RevenueByCinemaResponse>> dataResponse = DataResponse
                                .<List<RevenueByCinemaResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Top cinemas by revenue retrieved successfully")
                                .data(topCinemas)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }
}
