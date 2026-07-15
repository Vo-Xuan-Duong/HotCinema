package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.common.ApiResponse;
import com.example.hotcinemas_be.enums.*;
import com.example.hotcinemas_be.models.*;
import com.example.hotcinemas_be.repositorys.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RestController
@RequestMapping("/api/v1/seeder")
@Tag(name = "Data Seeder", description = "Endpoints for seeding data")
public class DataSeederController {

    private final MovieRepository movieRepository;
    private final MovieVersionRepository movieVersionRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;

    public DataSeederController(MovieRepository movieRepository,
                                MovieVersionRepository movieVersionRepository,
                                RoomRepository roomRepository,
                                ShowtimeRepository showtimeRepository) {
        this.movieRepository = movieRepository;
        this.movieVersionRepository = movieVersionRepository;
        this.roomRepository = roomRepository;
        this.showtimeRepository = showtimeRepository;
    }

    @PostMapping("/generate-movie-versions-and-showtimes")
    @PreAuthorize("hasAnyAuthority('MOVIE_UPDATE', 'SHOWTIME_CREATE')")
    public ResponseEntity<?> generateData(HttpServletRequest request) {
        List<Movie> allMovies = movieRepository.findAll();
        List<Movie> nowShowingMovies = new ArrayList<>();
        
        // 1. Generate MovieVersions
        int newVersionsCount = 0;
        for (Movie movie : allMovies) {
            if (movie.getStatus() == MovieStatus.NOW_SHOWING) {
                nowShowingMovies.add(movie);
                List<MovieVersion> versions = movieVersionRepository.findMovieVersionsByMovie_Id(movie.getId());
                if (versions.isEmpty()) {
                    MovieVersion newVersion = MovieVersion.builder()
                            .movie(movie)
                            .name("2D Phụ đề Việt")
                            .projectionType(ProjectionType.TWO_D)
                            .audioLanguage(AudioLanguage.EN)
                            .subtitleLanguage(SubtitleLanguage.VI)
                            .build();
                    movieVersionRepository.save(newVersion);
                    newVersionsCount++;
                }
            }
        }

        if (nowShowingMovies.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("No movies currently showing to generate showtimes for.", request, HttpStatus.OK));
        }

        // Get all available movie versions for now showing movies
        List<MovieVersion> allAvailableVersions = new ArrayList<>();
        for (Movie m : nowShowingMovies) {
            allAvailableVersions.addAll(movieVersionRepository.findMovieVersionsByMovie_Id(m.getId()));
        }

        if (allAvailableVersions.isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success("No movie versions found or created.", request, HttpStatus.OK));
        }

        // 2. Generate Showtimes for next 7 days starting from tomorrow
        List<Room> allRooms = roomRepository.findAll();
        LocalDate tomorrow = LocalDate.now().plusDays(1);
        Random random = new Random();
        LocalTime[] slotTimes = {
                LocalTime.of(9, 30),
                LocalTime.of(13, 0),
                LocalTime.of(16, 30),
                LocalTime.of(20, 0)
        };

        int newShowtimesCount = 0;
        List<Showtime> newShowtimes = new ArrayList<>();

        for (Room room : allRooms) {
            if (Boolean.TRUE.equals(room.getIsActive())) {
                for (int dayOffset = 0; dayOffset < 7; dayOffset++) {
                    LocalDate targetDate = tomorrow.plusDays(dayOffset);
                    
                    // Generate a few showtimes per room per day
                    for (LocalTime time : slotTimes) {
                        LocalDateTime startAt = LocalDateTime.of(targetDate, time);
                        
                        // Pick a random movie version
                        MovieVersion randomVersion = allAvailableVersions.get(random.nextInt(allAvailableVersions.size()));
                        
                        Showtime showtime = Showtime.builder()
                                .movieVersion(randomVersion)
                                .room(room)
                                .showtimeType(ShowtimeType.NORMAL)
                                .startAt(startAt)
                                .basePrice(new BigDecimal("85000.00"))
                                .status(ShowtimeStatus.UPCOMING)
                                .build();
                        
                        newShowtimes.add(showtime);
                        newShowtimesCount++;
                    }
                }
            }
        }
        
        showtimeRepository.saveAll(newShowtimes);

        String resultMessage = String.format("Successfully seeded %d new MovieVersions and %d new Showtimes.", newVersionsCount, newShowtimesCount);
        return ResponseEntity.ok(ApiResponse.success(resultMessage, request, HttpStatus.OK));
    }
}
