package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.seat.SeatSnapshot;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.models.Booking;
import com.example.hotcinemas_be.models.BookingSeat;
import com.example.hotcinemas_be.models.Seat;
import com.example.hotcinemas_be.models.Showtime;
import com.example.hotcinemas_be.repositorys.BookingRepository;
import com.example.hotcinemas_be.repositorys.BookingSeatRepository;
import com.example.hotcinemas_be.repositorys.SeatRepository;
import com.example.hotcinemas_be.repositorys.ShowtimeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingSeatService {
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;

    public Integer countBookedSeatsByShowtimeId(Long showtimeId) {
        return bookingSeatRepository.countBookingSeatsByBooking_Showtime_Id(showtimeId);
    }

    public List<Long> getBookedSeatIdsByShowtimeId(Long showtimeId) {
        List<BookingSeat> bookedSeats = bookingSeatRepository.findBookingSeatsByBooking_Showtime_Id(showtimeId);
        return bookedSeats.stream()
                .map(bookingSeat -> bookingSeat.getSeat().getId())
                .collect(Collectors.toList());
    }

    public void createBookingSeats(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(
                () -> new AppException("Booking not found", ErrorCode.BOOKING_NOT_FOUND)
        );

        Showtime showtime = booking.getShowtime();

        showtime.setUsedSeat(showtime.getUsedSeat() + booking.getSeatSnapshots().size());
        showtimeRepository.save(showtime);

        List<SeatSnapshot> seatSnapshots = booking.getSeatSnapshots();

        for (SeatSnapshot seatSnapshot : seatSnapshots) {
            Seat seat = seatRepository.findById(seatSnapshot.getSeatId()).orElseThrow(
                    () -> new AppException("Seat not found: " + seatSnapshot.getSeatName(), ErrorCode.SEAT_NOT_FOUND)
            );
            BookingSeat bookingSeat = BookingSeat.builder()
                    .booking(booking)
                    .seat(seat)
                    .price(seatSnapshot.getPrice())
                    .build();
            bookingSeatRepository.save(bookingSeat);
        }
    }
}
