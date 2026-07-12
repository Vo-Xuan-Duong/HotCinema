package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.theater.requests.RoomRequest;
import com.example.hotcinemas_be.dtos.theater.responses.RoomResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.RoomMapper;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.models.Room;
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
    private final RoomMapper roomMapper;
    private final CinemaRepository cinemaRepository;
    private final SeatService seatService;

    @Caching(evict = {
            @CacheEvict(value = "room", allEntries = true),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public RoomResponse createRoom(Long cinemaId, RoomRequest roomRequest) {
        Cinema cinema = cinemaRepository.findById(cinemaId)
                .orElseThrow(() -> new AppException("Cinema not found with id: " + cinemaId,
                        ErrorCode.CINEMA_NOT_FOUND));

        log.info("Creating room with request: {}", roomRequest);

        Room room = Room.builder()
                .name(roomRequest.getName())
                .cinema(cinema)
                .roomType(roomRequest.getRoomType())
                .audioType(roomRequest.getAudioType())
                .build();

        Room savedRoom = theaterRepository.save(room);

        seatService.createSeatsForTheater(savedRoom.getId(), roomRequest.getNumberOfRows(), roomRequest.getNumberOfColumns());
        return roomMapper.mapToResponse(savedRoom);
    }

    @Cacheable(value = "room", key = "#roomId", unless = "#result == null")
    public Object getRoomById(Long roomId) {
        Room room = theaterRepository.findById(roomId).orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));
        return roomMapper.mapToResponse(room);
    }

    @Caching(evict = {
            @CacheEvict(value = "room", key = "#roomId"),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public RoomResponse updateRoom(Long roomId, RoomRequest roomRequest) {
        Room room = theaterRepository.findById(roomId).orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));

        room.setName(roomRequest.getName());
        room.setRoomType(roomRequest.getRoomType());
        room.setRoomType(roomRequest.getRoomType());
        room.setAudioType(roomRequest.getAudioType());

        Room updatedRoom = theaterRepository.save(room);
        return roomMapper.mapToResponse(updatedRoom);
    }

    @Caching(evict = {
            @CacheEvict(value = "room", key = "#roomId"),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public void deleteRoom(Long roomId) {
        Room room = theaterRepository.findById(roomId).orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));
        theaterRepository.delete(room);
    }

    @Cacheable(value = "rooms-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()", unless = "#result == null")
    public Object getPageRooms(Pageable pageable) {
        Page<Room> rooms = theaterRepository.findAll(pageable);
        return rooms.map(roomMapper::mapToResponse);
    }

    @Cacheable(value = "rooms-list", unless = "#result == null")
    public Object getAllRooms() {
        List<Room> rooms = theaterRepository.findAll();
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found", ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(roomMapper::mapToResponse).toList();
    }

    public List<RoomResponse> getAllRoomsByCinemaId(Long cinemaId) {
        return List.of();
    }

    @Cacheable(value = "rooms-by-cinema", key = "#cinemaId", unless = "#result == null")
    public Object getPageRoomsByCinemaId(Long cinemaId) {
        List<Room> rooms = theaterRepository.findTheaterByCinema_Id(cinemaId);
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found for cinema with id: " + cinemaId, ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(roomMapper::mapToResponse).toList();
    }

    @Caching(evict = {
            @CacheEvict(value = "room", allEntries = true),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", key = "#cinemaId")
    })
    public void deleteRoomsByCinemaId(Long cinemaId) {
        List<Room> rooms = theaterRepository.findTheaterByCinema_Id(cinemaId);
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found for cinema with id: " + cinemaId, ErrorCode.MODEL_NOT_FOUND);
        }
        for (Room room : rooms) {
            seatService.deleteSeatsByTheaterId(room.getId());
            theaterRepository.delete(room);
        }
    }

    @Cacheable(value = "rooms-count", key = "#cinemaId")
    public Integer getNumberRoomsByCinemaId(Long cinemaId) {
        return theaterRepository.countTheaterByCinema_Id(cinemaId);
    }

    @Cacheable(value = "rooms-list", key = "'no-page'", unless = "#result == null")
    public Object getAllRoomsNoPage() {
        List<Room> rooms = theaterRepository.findAll();
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found", ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(roomMapper::mapToResponse).toList();
    }
}
