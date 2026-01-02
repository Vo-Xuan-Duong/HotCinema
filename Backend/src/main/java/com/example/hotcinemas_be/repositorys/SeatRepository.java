package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import com.example.hotcinemas_be.models.Seat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findSeatsByTheater_Id(Long theaterId);

    List<Seat> findSeatsByTheater_IdAndSeatStatus(Long theaterId, SeatStatus seatStatus);

    List<Seat> findSeatsBySeatType(SeatType seatType);

    List<Seat> findSeatsByTheater_IdAndSeatType(Long theaterId, SeatType seatType);

    Optional<Seat> findSeatByTheater_IdAndName(Long theaterId, String name);

    Page<Seat> findSeatsByTheater_Id(Long theaterId, Pageable pageable);

    @Query("SELECT s FROM Seat s WHERE s.theater.cinema.id = :cinemaId")
    List<Seat> findByCinemaId(@Param("cinemaId") Long cinemaId);

    List<Seat> findSeatsByTheater_Cinema_Id(Long cinemaId);
}
