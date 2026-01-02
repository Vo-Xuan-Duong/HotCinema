package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.seat.responses.SeatUpdateForWebSocket;
import com.example.hotcinemas_be.dtos.showtime.requests.ShowtimeFilterRequest;
import com.example.hotcinemas_be.dtos.showtime.requests.ShowtimeRequest;
import com.example.hotcinemas_be.dtos.showtime.responses.*;
import com.example.hotcinemas_be.enums.ShowtimeStatus;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.ShowtimeMapper;
import com.example.hotcinemas_be.models.*;
import com.example.hotcinemas_be.repositorys.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final ShowtimeMapper showtimeMapper;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final CinemaRepository cinemaRepository;
    private final RedisService redisService;
    private final WebSocketService webSocketService;
    private final AuthService authService;
    private final BookingSeatService bookingSeatService;

    @Caching(evict = {
            @CacheEvict(value = "showtime", allEntries = true),
            @CacheEvict(value = "showtimes-page", allEntries = true),
            @CacheEvict(value = "showtimes-by-movie", allEntries = true),
            @CacheEvict(value = "showtimes-by-theater", allEntries = true),
            @CacheEvict(value = "showtimes-filtered", allEntries = true)
    })
    public ShowtimeResponse createShowtime(ShowtimeRequest showtimeRequest) {
        Theater theater = theaterRepository.findById(showtimeRequest.getTheaterId()).orElseThrow(
                () -> new AppException("Theater not found with id: " + showtimeRequest.getTheaterId(),
                        ErrorCode.MODEL_NOT_FOUND));

        Movie movie = movieRepository.findById(showtimeRequest.getMovieId())
                .orElseThrow(() -> new AppException("Movie not found with id: " + showtimeRequest.getMovieId(),
                        ErrorCode.MODEL_NOT_FOUND));

        if (isOverlappingShowtime(showtimeRequest.getTheaterId(), showtimeRequest.getShowDate(),
                showtimeRequest.getStartTime(),
                showtimeRequest.getStartTime().plusMinutes(movie.getDurationMinutes()))) {
            throw new AppException("Showtime overlaps with an existing showtime in the same Theater.",
                    ErrorCode.SHOWTIME_CONFLICT);
        }

        Showtime showtime = new Showtime();
        showtime.setMovie(movie);
        showtime.setTheater(theater);
        showtime.setShowDate(showtimeRequest.getShowDate());
        showtime.setStartTime(showtimeRequest.getStartTime());
        showtime.setEndTime(showtimeRequest.getStartTime().plusMinutes(movie.getDurationMinutes()));
        showtime.setBasePrice(showtimeRequest.getBasePrice());
        showtime.setFormat(showtimeRequest.getFormat());
        showtime.setAudioType(showtimeRequest.getAudioType());
        showtime.setStatus(ShowtimeStatus.UPCOMING);

        showtime = showtimeRepository.save(showtime);

        return showtimeMapper.mapToResponse(showtime);
    }

    private Boolean isOverlappingShowtime(Long theaterId, LocalDate date, LocalTime startTime, LocalTime endTime) {
        return showtimeRepository.existsOverlapping(theaterId, date, startTime, endTime);
    }

    @Caching(evict = {
            @CacheEvict(value = "showtime", key = "#showtimeId"),
            @CacheEvict(value = "showtimes-page", allEntries = true),
            @CacheEvict(value = "showtimes-by-movie", allEntries = true),
            @CacheEvict(value = "showtimes-by-theater", allEntries = true),
            @CacheEvict(value = "showtimes-filtered", allEntries = true)
    })
    public ShowtimeResponse updateShowtime(Long showtimeId, ShowtimeRequest showtimeRequest) {
        Theater theater = theaterRepository.findById(showtimeRequest.getTheaterId()).orElseThrow(
                () -> new AppException("Theater not found with id: " + showtimeRequest.getTheaterId(),
                        ErrorCode.MODEL_NOT_FOUND));
        Movie movie = movieRepository.findById(showtimeRequest.getMovieId())
                .orElseThrow(() -> new AppException("Movie not found with id: " + showtimeRequest.getMovieId(),
                        ErrorCode.MODEL_NOT_FOUND));

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException("Showtime not found with id: " + showtimeId,
                        ErrorCode.MODEL_NOT_FOUND));
        showtime.setMovie(movie);
        showtime.setTheater(theater);
        showtime.setShowDate(showtimeRequest.getShowDate());
        showtime.setStartTime(showtimeRequest.getStartTime());
        showtime.setEndTime(showtimeRequest.getStartTime().plusMinutes(movie.getDurationMinutes()));
        showtime.setBasePrice(showtimeRequest.getBasePrice());
        showtime.setFormat(showtimeRequest.getFormat());
        showtime.setAudioType(showtimeRequest.getAudioType());
        showtime.setStatus(showtimeRequest.getStatus());

        showtime = showtimeRepository.save(showtime);

        return showtimeMapper.mapToResponse(showtime);
    }

    @Cacheable(value = "showtime", key = "#showtimeId", unless = "#result == null")
    public Object getShowtimeById(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException("Showtime not found with id: " + showtimeId,
                        ErrorCode.MODEL_NOT_FOUND));
        return showtimeMapper.mapToResponse(showtime);
    }

    @Cacheable(value = "showtimes-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()", unless = "#result == null")
    public Object getAllShowTimes(Pageable pageable) {
        Page<Showtime> showtimePage = showtimeRepository.findAll(pageable);
        return showtimePage.map(showtimeMapper::mapToResponse);
    }

    @Caching(evict = {
            @CacheEvict(value = "showtime", key = "#showtimeId"),
            @CacheEvict(value = "showtimes-page", allEntries = true),
            @CacheEvict(value = "showtimes-by-movie", allEntries = true),
            @CacheEvict(value = "showtimes-by-theater", allEntries = true),
            @CacheEvict(value = "showtimes-filtered", allEntries = true)
    })
    public void deleteShowtime(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException("Showtime not found with id: " + showtimeId,
                        ErrorCode.MODEL_NOT_FOUND));

        showtimeRepository.delete(showtime);
    }

    @Cacheable(value = "showtimes-by-movie", key = "#movieId + '-' + #pageable.pageNumber + '-' + #pageable.pageSize", unless = "#result == null")
    public Object getShowtimesByMovieId(Long movieId, Pageable pageable) {
        Page<Showtime> showtimePage = showtimeRepository.findByMovie_Id(movieId, pageable);
        return showtimePage.map(showtimeMapper::mapToResponse);
    }

    @Cacheable(value = "showtimes-by-theater", key = "#theaterId + '-' + #pageable.pageNumber + '-' + #pageable.pageSize", unless = "#result == null")
    public Object getShowtimesByTheaterId(Long theaterId, Pageable pageable) {
        Page<Showtime> showtimePage = showtimeRepository.findByTheater_Id(theaterId, pageable);
        return showtimePage.map(showtimeMapper::mapToResponse);
    }

    @Caching(evict = {
            @CacheEvict(value = "showtime", allEntries = true),
            @CacheEvict(value = "showtimes-page", allEntries = true),
            @CacheEvict(value = "showtimes-by-movie", allEntries = true),
            @CacheEvict(value = "showtimes-by-theater", allEntries = true),
            @CacheEvict(value = "showtimes-filtered", allEntries = true)
    })
    public void deleteShowtimesByMovieId(Long movieId) {

        List<Showtime> showtimes = showtimeRepository.findByMovie_Id(movieId);
        if (showtimes.isEmpty()) {
            return;
        }
        showtimeRepository.deleteAll(showtimes);

    }

    @Caching(evict = {
            @CacheEvict(value = "showtime", allEntries = true),
            @CacheEvict(value = "showtimes-page", allEntries = true),
            @CacheEvict(value = "showtimes-by-movie", allEntries = true),
            @CacheEvict(value = "showtimes-by-theater", allEntries = true),
            @CacheEvict(value = "showtimes-filtered", allEntries = true)
    })
    public void deleteShowtimesByTheaterId(Long theaterId) {
        List<Showtime> showtimes = showtimeRepository.findByTheater_Id(theaterId);
        if (showtimes.isEmpty()) {
            return;
        }
        showtimeRepository.deleteAll(showtimes);
    }

    @Caching(evict = {
            @CacheEvict(value = "showtime", key = "#showtimeId"),
            @CacheEvict(value = "showtimes-page", allEntries = true),
            @CacheEvict(value = "showtimes-by-movie", allEntries = true),
            @CacheEvict(value = "showtimes-by-theater", allEntries = true),
            @CacheEvict(value = "showtimes-filtered", allEntries = true)
    })
    public boolean updateShowtimeStatus(Long showtimeId, ShowtimeStatus status) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException("Showtime not found with id: " + showtimeId,
                        ErrorCode.MODEL_NOT_FOUND));
        if (showtime.getStatus() == status) {
            return false; // No change needed
        }
        showtime.setStatus(status);
        showtimeRepository.save(showtime);
        return true;
    }

    @Cacheable(value = "showtimes-filtered", key = "#filterRequest.toString()", unless = "#result == null")
    public Object getShowtimesWithFilters(ShowtimeFilterRequest filterRequest) {
        List<Showtime> showtimes = showtimeRepository.findShowtimesWithFilters(
                filterRequest.getMovieId(),
                filterRequest.getCinemaAddress(),
                filterRequest.getCinemaCity(),
                filterRequest.getCinemaId(),
                filterRequest.getShowDate(),
                filterRequest.getFormat());
        return showtimes.stream().map(showtimeMapper::mapToResponse).toList();
    }

    public Page<CinemaWithShowtimes> getCinemaShowtimesByMovieAndDate(
            Long movieId, LocalDate date, Long regionId, Double latitude, Double longitude, Pageable pageable) {

        Page<Cinema> cinemaIdsPage;

        if (regionId != null) {
            cinemaIdsPage = cinemaRepository.findCinemasByRegion_IdAndIsActiveTrue(regionId, pageable);
        } else if (latitude != null && longitude != null) {
            cinemaIdsPage = cinemaRepository.findNearestCinemas(latitude, longitude, pageable);
        } else {
            cinemaIdsPage = cinemaRepository.findAll(pageable);
        }

        List<Long> cinemaIds = cinemaIdsPage.getContent().stream()
                .map(Cinema::getId)
                .toList();

        List<Showtime> showtimes = showtimeRepository.findByMovieDateAndCinemaIds(movieId, date, cinemaIds);

        List<CinemaWithShowtimes> cinemaList = showtimeMapper.groupShowtimesByCinema(showtimes);

        if (latitude != null && longitude != null) {
            for (CinemaWithShowtimes cinema : cinemaList) {
                double distance = calculateDistance(
                        latitude,
                        longitude,
                        cinema.getLatitude(),
                        cinema.getLongitude());
                cinema.setDistance(distance);
            }
            cinemaList.sort((c1, c2) -> Double.compare(c1.getDistance(), c2.getDistance()));
        }

        return new org.springframework.data.domain.PageImpl<>(
                cinemaList,
                pageable,
                cinemaIdsPage.getTotalElements());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS = 6371; // Earth's radius in kilometers

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c; // Distance in kilometers
    }

    public Page<MovieWithShowtimes> getShowtimesByCinemaAndDate(Long cinemaId, LocalDate date, Pageable pageable) {
        Page<Long> movieIdsPage = showtimeRepository.findDistinctMovieIdsByCinemaAndDate(cinemaId, date, pageable);

        List<Long> movieIds = movieIdsPage.getContent();

        List<Showtime> showtimes = showtimeRepository.findByCinemaDateAndMovieIds(cinemaId, date, movieIds);

        List<MovieWithShowtimes> movieList = showtimeMapper.groupShowtimesByMovie(showtimes);

        return new org.springframework.data.domain.PageImpl<>(
                movieList,
                pageable,
                movieIdsPage.getTotalElements());
    }

    // Scheduler: update showtime statuses by time
    @Transactional
    @Scheduled(fixedDelay = 60000) // Run every minute
    public void updateShowtimeStatusesJob() {
        LocalTime now = LocalTime.now();
        LocalDate today = LocalDate.now();

        // OPEN_FOR_BOOKING -> BOOKING_CLOSED (30 minutes before start time)
        LocalTime bookingCutoffTime = now.plusMinutes(30);
        List<Showtime> toBookingClosed = showtimeRepository.findByStatusAndShowDateAndStartTimeLessThanEqual(
                ShowtimeStatus.AVAILABLE, today, bookingCutoffTime);
        toBookingClosed.forEach(s -> s.setStatus(ShowtimeStatus.SALES_ENDED));
        if (!toBookingClosed.isEmpty()) {
            showtimeRepository.saveAll(toBookingClosed);
            log.info("Updated {} showtime to BOOKING_CLOSED", toBookingClosed.size());
        }

        List<Showtime> toFinished = showtimeRepository
                .findByStatusAndShowDateAndEndTimeLessThanEqual(
                        ShowtimeStatus.SALES_ENDED, today, now);
        toFinished.forEach(s -> s.setStatus(ShowtimeStatus.COMPLETED));
        if (!toFinished.isEmpty()) {
            showtimeRepository.saveAll(toFinished);
            log.info("Updated {} showtime to FINISHED", toFinished.size());
        }
    }

    @Scheduled(fixedDelay = 1000) // Run every second
    public void releaseExpiredSeatLocksJob() {
        try {
            // Get all keys matching the seat lock pattern
            java.util.Set<String> lockKeys = redisService.keys("seat_lock:showtime_*:seat_*");

            if (lockKeys == null || lockKeys.isEmpty()) {
                return;
            }

            int releasedCount = 0;
            for (String key : lockKeys) {
                Long ttl = redisService.getExpire(key);

                if (ttl != null && ttl <= 0 && ttl != -1) {
                    String[] parts = key.split(":");
                    if (parts.length == 3) {
                        try {
                            Long showtimeId = Long.parseLong(parts[1].replace("showtime_", ""));
                            Long seatId = Long.parseLong(parts[2].replace("seat_", ""));

                            redisService.delete(key);

                            webSocketService.sendSeatUpdate(showtimeId,
                                    SeatUpdateForWebSocket.builder()
                                            .seatId(seatId)
                                            .status(com.example.hotcinemas_be.enums.SeatStatus.AVAILABLE)
                                            .build());

                            releasedCount++;
                        } catch (NumberFormatException e) {
                            log.warn("Failed to parse seat lock key: {}", key);
                        }
                    }
                }
            }

            if (releasedCount > 0) {
                log.info("Released {} expired seat locks", releasedCount);
            }
        } catch (Exception e) {
            log.error("Error in releaseExpiredSeatLocksJob: {}", e.getMessage(), e);
        }
    }

    public void lockSeatForShowtime(Long showtimeId, Long seatId, Long userId) {
        String key = "seat_lock:showtime_" + showtimeId + ":seat_" + seatId;

        if (redisService.hasKey(key)) {
            throw new AppException("Seat is already locked for this showtime.",
                    ErrorCode.SEAT_ALREADY_LOCKED);
        }

        redisService.set(key, userId, 10, java.util.concurrent.TimeUnit.MINUTES);

        webSocketService.sendSeatUpdate(showtimeId,
                SeatUpdateForWebSocket.builder()
                        .seatId(seatId)
                        .lockedByUserId(userId)
                        .status(com.example.hotcinemas_be.enums.SeatStatus.HELD)
                        .build());
    }

    public void extendSeatLockTime(Long showtimeId, Long seatId, Long userId) {
        String key = "seat_lock:showtime_" + showtimeId + ":seat_" + seatId;

        Object lockedBy = redisService.get(key);
        if (lockedBy == null || !lockedBy.toString().equals(userId.toString())) {
            throw new AppException("Cannot extend lock time. Seat is not locked by this user.",
                    ErrorCode.SEAT_NOT_LOCKED_BY_USER);
        }

        redisService.setExpire(key, 10, java.util.concurrent.TimeUnit.MINUTES);
    }

    public void unlockSeatForShowtime(Long showtimeId, Long seatId) {
        String key = "seat_lock:showtime_" + showtimeId + ":seat_" + seatId;

        if (redisService.hasKey(key)) {
            redisService.delete(key);
        }

        webSocketService.sendSeatUpdate(showtimeId,
                SeatUpdateForWebSocket.builder()
                        .seatId(seatId)
                        .lockedByUserId(0L)
                        .status(com.example.hotcinemas_be.enums.SeatStatus.AVAILABLE)
                        .build());
    }

    public List<ShowtimeSeatResponse> getSeatsByShowtimeId(Long showtimeId) {
        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new AppException("Showtime not found with id: " + showtimeId,
                        ErrorCode.MODEL_NOT_FOUND));

        List<Seat> seats = showtime.getTheater().getSeats();

        List<String> seatKeys = seats.stream()
                .map(seat -> "seat_lock:showtime_" + showtimeId + ":seat_" + seat.getId())
                .toList();

        List<Object> redisValues = redisService.getMultiple(seatKeys);

        java.util.Map<Long, Long> seatLockMap = new java.util.HashMap<>();
        for (int i = 0; i < seats.size(); i++) {
            Object val = (redisValues != null && i < redisValues.size()) ? redisValues.get(i) : null;
            if (Objects.nonNull(val)) {
                try {
                    Long userId = Long.valueOf(val.toString());
                    seatLockMap.put(seats.get(i).getId(), userId);
                } catch (NumberFormatException e) {
                    // Log error nếu cần
                }
            }
        }

        List<Long> seatIdsBooked = bookingSeatService.getBookedSeatIdsByShowtimeId(showtimeId);
        java.util.Set<Long> bookedSeatIds = (seatIdsBooked == null) ? java.util.Collections.emptySet()
                : new java.util.HashSet<>(seatIdsBooked);

        BigDecimal basePrice = showtime.getBasePrice();

        return seats.stream()
                .map(seat -> {
                    com.example.hotcinemas_be.enums.SeatStatus status;
                    Long lockedBy = null;

                    if (bookedSeatIds.contains(seat.getId())) {
                        status = com.example.hotcinemas_be.enums.SeatStatus.BOOKED;
                    } else if (seatLockMap.containsKey(seat.getId())) {
                        status = com.example.hotcinemas_be.enums.SeatStatus.HELD;
                        lockedBy = seatLockMap.get(seat.getId());
                    } else {
                        status = seat.getSeatStatus();
                    }

                    // Calculate price based on seat type
                    BigDecimal seatPrice = calculateSeatPrice(basePrice, seat.getSeatType());

                    return ShowtimeSeatResponse.builder()
                            .id(seat.getId())
                            .name(seat.getName())
                            .seatType(seat.getSeatType())
                            .status(status)
                            .price(seatPrice)
                            .col(seat.getCol())
                            .row(seat.getRow())
                            .lockedByUserId(lockedBy != null ? lockedBy : 0)
                            .build();
                })
                .toList();
    }

    private BigDecimal calculateSeatPrice(BigDecimal basePrice, com.example.hotcinemas_be.enums.SeatType seatType) {
        if (basePrice == null) {
            basePrice = BigDecimal.ZERO;
        }

        return switch (seatType) {
            case VIP -> basePrice.add(new BigDecimal("20000"));
            case COUPLE ->
                // Couple seat is for 2 people, so multiply by 2 and add extra fee
                basePrice.multiply(new BigDecimal("2"));
            default -> basePrice;
        };
    }
}
