package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.theater.requests.TheaterRequest;
import com.example.hotcinemas_be.dtos.theater.responses.TheaterResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.TheaterMapper;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.models.Theater;
import com.example.hotcinemas_be.repositorys.CinemaRepository;
import com.example.hotcinemas_be.repositorys.TheaterRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class TheaterService {

    private final TheaterRepository theaterRepository;
    private final TheaterMapper theaterMapper;
    private final CinemaRepository cinemaRepository;
    private final SeatService seatService;

    @Caching(evict = {
            @CacheEvict(value = "room", allEntries = true),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public TheaterResponse createRoom(Long cinemaId, TheaterRequest theaterRequest) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException("Cinema not found with id: " + cinemaId,
                        ErrorCode.CINEMA_NOT_FOUND));

        log.info("Creating room with request: {}", theaterRequest);

        Theater theater = Theater.builder()
                .name(theaterRequest.getName())
                .cinema(cinema)
                .theaterType(theaterRequest.getTheaterType())
                .totalSeats(theaterRequest.getNumberOfRows()*theaterRequest.getNumberOfColumns())
                .screenType(theaterRequest.getScreenType())
                .soundSystem(theaterRequest.getSoundSystem())
                .build();

        Theater savedTheater = theaterRepository.save(theater);

        seatService.createSeatsForTheater(savedTheater.getId(), theaterRequest.getNumberOfRows(), theaterRequest.getNumberOfColumns());
        return theaterMapper.mapToResponse(savedTheater);
    }

    @Cacheable(value = "room", key = "#roomId", unless = "#result == null")
    public Object getRoomById(Long roomId) {
        Theater theater = theaterRepository.findById(roomId).orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));
        return theaterMapper.mapToResponse(theater);
    }

    @Caching(evict = {
            @CacheEvict(value = "room", key = "#roomId"),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public TheaterResponse updateRoom(Long roomId, TheaterRequest theaterRequest) {
        Theater theater = theaterRepository.findById(roomId).orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));

        theater.setName(theaterRequest.getName());
        theater.setTheaterType(theaterRequest.getTheaterType());
        theater.setScreenType(theaterRequest.getScreenType());
        theater.setSoundSystem(theaterRequest.getSoundSystem());

        Theater updatedTheater = theaterRepository.save(theater);
        return theaterMapper.mapToResponse(updatedTheater);
    }

    @Caching(evict = {
            @CacheEvict(value = "room", key = "#roomId"),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public void deleteRoom(Long roomId) {
        Theater theater = theaterRepository.findById(roomId).orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));
        theaterRepository.delete(theater);
    }

    @Cacheable(value = "rooms-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()", unless = "#result == null")
    public Object getPageRooms(Pageable pageable) {
        Page<Theater> rooms = theaterRepository.findAll(pageable);
        return rooms.map(theaterMapper::mapToResponse);
    }

    @Cacheable(value = "rooms-list", unless = "#result == null")
    public Object getAllRooms() {
        List<Theater> rooms = theaterRepository.findAll();
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found", ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(theaterMapper::mapToResponse).toList();
    }

    public List<TheaterResponse> getAllRoomsByCinemaId(Long cinemaId) {
        return List.of();
    }

    @Cacheable(value = "rooms-by-cinema", key = "#cinemaId", unless = "#result == null")
    public Object getPageRoomsByCinemaId(Long cinemaId) {
        List<Theater> rooms = theaterRepository.findTheaterByCinema_Id(cinemaId);
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found for cinema with id: " + cinemaId, ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(theaterMapper::mapToResponse).toList();
    }

    @Caching(evict = {
            @CacheEvict(value = "room", allEntries = true),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", key = "#cinemaId")
    })
    public void deleteRoomsByCinemaId(Long cinemaId) {
        List<Theater> rooms = theaterRepository.findTheaterByCinema_Id(cinemaId);
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found for cinema with id: " + cinemaId, ErrorCode.MODEL_NOT_FOUND);
        }
        for (Theater theater : rooms) {
            seatService.deleteSeatsByTheaterId(theater.getId());
            theaterRepository.delete(theater);
        }
    }

    @Cacheable(value = "rooms-count", key = "#cinemaId")
    public Integer getNumberRoomsByCinemaId(Long cinemaId) {
        return theaterRepository.countTheaterByCinema_Id(cinemaId);
    }

    @Cacheable(value = "rooms-list", key = "'no-page'", unless = "#result == null")
    public Object getAllRoomsNoPage() {
        List<Theater> rooms = theaterRepository.findAll();
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found", ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(theaterMapper::mapToResponse).toList();
    }
}
