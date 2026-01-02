package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.seat.requests.SeatRequest;
import com.example.hotcinemas_be.dtos.seat.responses.SeatResponse;
import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.mappers.SeatMapper;
import com.example.hotcinemas_be.models.Seat;
import com.example.hotcinemas_be.models.Theater;
import com.example.hotcinemas_be.repositorys.SeatRepository;
import com.example.hotcinemas_be.repositorys.TheaterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@Transactional
@RequiredArgsConstructor
public class SeatService {

    private final SeatRepository seatRepository;
    private final SeatMapper seatMapper;
    private final TheaterRepository theaterRepository;

    public SeatResponse createSeat(SeatRequest seatRequest) {
        Theater theater = theaterRepository.findById(seatRequest.getTheaterId())
                .orElseThrow(() -> new AppException("Room not found with id: " + seatRequest.getTheaterId(),
                        ErrorCode.ROOM_NOT_FOUND));

        seatRepository.findSeatByTheater_IdAndName(
                seatRequest.getTheaterId(),
                seatRequest.getName()).ifPresent(seat -> {
                    throw new AppException("Seat already exists at position " +
                            seatRequest.getName() + " in room "
                            + seatRequest.getTheaterId(), ErrorCode.DUPLICATE_RESOURCE);
                });

        Seat seat = Seat.builder()
                .theater(theater)
                .name(seatRequest.getName())
                .seatType(seatRequest.getSeatType() != null ? seatRequest.getSeatType() : SeatType.REGULAR)
                .seatStatus(seatRequest.getSeatStatus() != null ? seatRequest.getSeatStatus() : SeatStatus.AVAILABLE)
                .row(seatRequest.getRow())
                .col(seatRequest.getCol())
                .build();

        Seat savedSeat = seatRepository.save(seat);
        return seatMapper.mapToResponse(savedSeat);
    }

    @Transactional(readOnly = true)
    public SeatResponse getSeatById(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException("Seat not found with id: " + seatId,
                        ErrorCode.SEAT_NOT_FOUND));
        return seatMapper.mapToResponse(seat);
    }

    public SeatResponse updateSeat(Long seatId, SeatRequest seatRequest) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException("Seat not found with id: " + seatId,
                        ErrorCode.SEAT_NOT_FOUND));

        // Update other fields
        if (seatRequest.getName() != null) {
            seat.setName(seatRequest.getName());
        }
        if (seatRequest.getSeatType() != null) {
            seat.setSeatType(seatRequest.getSeatType());
        }
        if (seatRequest.getSeatStatus() != null) {
            seat.setSeatStatus(seatRequest.getSeatStatus());
        }
        if (seatRequest.getCol() != null) {
            seat.setCol(seatRequest.getCol());
        }
        if (seatRequest.getRow() != null) {
            seat.setRow(seatRequest.getRow());
        }

        Seat updatedSeat = seatRepository.save(seat);
        return seatMapper.mapToResponse(updatedSeat);
    }

    public void deleteSeat(Long seatId) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException("Seat not found with id: " + seatId,
                        ErrorCode.SEAT_NOT_FOUND));
        seatRepository.delete(seat);
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByTheaterId(Long theaterId) {
        List<Seat> seats = seatRepository.findSeatsByTheater_Id(theaterId);
        return seats.stream().map(seatMapper::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByTheaterIdAndActive(Long theaterId) {
        List<Seat> seats = seatRepository.findSeatsByTheater_IdAndSeatStatus(theaterId, SeatStatus.AVAILABLE);
        return seats.stream().map(seatMapper::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsBySeatType(SeatType seatType) {
        List<Seat> seats = seatRepository.findSeatsBySeatType(seatType);
        return seats.stream().map(seatMapper::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByTheaterIdAndSeatType(Long theaterId, SeatType seatType) {
        List<Seat> seats = seatRepository.findSeatsByTheater_IdAndSeatType(theaterId, seatType);
        return seats.stream().map(seatMapper::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByCinemaId(Long cinemaId) {
        List<Seat> seats = seatRepository.findByCinemaId(cinemaId);
        return seats.stream().map(seatMapper::mapToResponse).toList();
    }

    @Async
    @Transactional
    public void createSeatsForTheater(Long theaterId, Integer rowsCount, Integer seatsPerRow) {
        if (theaterId == null) {
            throw new IllegalArgumentException("Room ID cannot be null");
        }
        if (rowsCount == null || seatsPerRow == null || rowsCount <= 0 || seatsPerRow <= 0) {
            throw new IllegalArgumentException("Invalid seat configuration");
        }

        Theater theater = theaterRepository.findById(theaterId)
                .orElseThrow(() -> new AppException("Room not found with id: " + theaterId,
                        ErrorCode.ROOM_NOT_FOUND));

        List<Seat> seatsToSave = new ArrayList<>();

        for (int rowIndex = 1; rowIndex <= rowsCount; rowIndex++) {

            char rowLetter = (char) ('A' + rowIndex - 1);
            String rowLabel = String.valueOf(rowLetter);

            for (int seatNumber = 1; seatNumber <= seatsPerRow; seatNumber++) {
                Seat seat = Seat.builder()
                        .theater(theater)
                        .name(rowLetter + String.valueOf(seatNumber))
                        .seatType(SeatType.REGULAR)
                        .seatStatus(SeatStatus.AVAILABLE)
                        .col(seatNumber)
                        .row(rowIndex)
                        .build();

                seatsToSave.add(seat);
            }
        }

        seatRepository.saveAll(seatsToSave);
    }

    public void deleteSeatsByTheaterId(Long theaterId) {
        List<Seat> seats = seatRepository.findSeatsByTheater_Id(theaterId);
        if (seats.isEmpty()) {
            throw new AppException("No seats found for room with id: " + theaterId,
                    ErrorCode.SEAT_NOT_FOUND);
        }
        seatRepository.deleteAll(seats);
    }

    public void changeStatusSeat(Long seatId, SeatStatus seatStatus) {
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new AppException("Seat not found with id: " + seatId,
                        ErrorCode.SEAT_NOT_FOUND));
        seat.setSeatStatus(seatStatus);
        seatRepository.save(seat);
    }
}
