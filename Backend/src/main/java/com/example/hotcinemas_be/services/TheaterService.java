package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.theater.requests.TheaterRequest;
import com.example.hotcinemas_be.dtos.theater.responses.TheaterResponse;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.RoomMapper;
import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.repositorys.CinemaRepository;
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
public class RoomService {

    private final RoomRepository roomRepository;
    private final RoomMapper roomMapper;
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

        Room room = new Room();
        room.setName(theaterRequest.getName());
        room.setRoomType(theaterRequest.getRoomType());
        room.setPrice(theaterRequest.getPrice());
        room.setIsActive(true);
        room.setCinema(cinema);
        Room savedRoom = roomRepository.save(room);

        seatService.createSeatsForRoom(savedRoom.getId(), theaterRequest.getRowsCount(), theaterRequest.getSeatsPerRow(),
                theaterRequest.getRowVip());
        return roomMapper.mapToResponse(savedRoom);
    }

    @Cacheable(value = "room", key = "#roomId", unless = "#result == null")
    public TheaterResponse getRoomById(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));
        return roomMapper.mapToResponse(room);
    }

    @Caching(evict = {
            @CacheEvict(value = "room", key = "#roomId"),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public TheaterResponse updateRoom(Long roomId, TheaterRequest theaterRequest) {
        Room room = roomRepository.findById(roomId).orElseThrow(
                () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));

        room.setName(theaterRequest.getName());
        room.setRoomType(theaterRequest.getRoomType());
        room.setPrice(theaterRequest.getPrice());
        room.setIsActive(room.getIsActive());

        return roomMapper.mapToResponse(roomRepository.save(room));
    }

    @Caching(evict = {
            @CacheEvict(value = "room", key = "#roomId"),
            @CacheEvict(value = "rooms-page", allEntries = true),
            @CacheEvict(value = "rooms-list", allEntries = true),
            @CacheEvict(value = "rooms-by-cinema", allEntries = true)
    })
    public void deleteRoom(Long roomId) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(
                        () -> new AppException("Room not found with id: " + roomId, ErrorCode.MODEL_NOT_FOUND));
        roomRepository.delete(room);
    }

    @Cacheable(value = "rooms-page", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort.toString()", unless = "#result.content.isEmpty()")
    public Page<TheaterResponse> getPageRooms(Pageable pageable) {
        Page<Room> rooms = roomRepository.findAll(pageable);
        return rooms.map(roomMapper::mapToResponse);
    }

    @Cacheable(value = "rooms-list", unless = "#result == null || #result.isEmpty()")
    public List<TheaterResponse> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found", ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(roomMapper::mapToResponse).toList();
    }

    public List<TheaterResponse> getAllRoomsByCinemaId(Long cinemaId) {
        return List.of();
    }

    @Cacheable(value = "rooms-by-cinema", key = "#cinemaId", unless = "#result == null || #result.isEmpty()")
    public List<TheaterResponse> getPageRoomsByCinemaId(Long cinemaId) {
        List<Room> rooms = roomRepository.findRoomsByCinema_Id(cinemaId);
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
        List<Room> rooms = roomRepository.findRoomsByCinema_Id(cinemaId);
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found for cinema with id: " + cinemaId, ErrorCode.MODEL_NOT_FOUND);
        }
        for (Room room : rooms) {
            seatService.deleteSeatsByRoomId(room.getId());
            roomRepository.delete(room);
        }
    }

    @Cacheable(value = "rooms-count", key = "#cinemaId")
    public Integer getNumberRoomsByCinemaId(Long cinemaId) {
        return roomRepository.countByCinema_Id(cinemaId);
    }

    @Cacheable(value = "rooms-list", key = "'no-page'", unless = "#result == null || #result.isEmpty()")
    public List<TheaterResponse> getAllRoomsNoPage() {
        List<Room> rooms = roomRepository.findAll();
        if (rooms.isEmpty()) {
            throw new AppException("No rooms found", ErrorCode.MODEL_NOT_FOUND);
        }
        return rooms.stream().map(roomMapper::mapToResponse).toList();
    }
}
