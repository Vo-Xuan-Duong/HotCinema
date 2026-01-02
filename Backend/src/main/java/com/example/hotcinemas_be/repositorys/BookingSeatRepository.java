package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    Integer countBookingSeatsByBooking_Showtime_Id(Long bookingShowtimeId);

    List<BookingSeat> findBookingSeatsByBooking_Showtime_Id(Long showtimeId);
}
