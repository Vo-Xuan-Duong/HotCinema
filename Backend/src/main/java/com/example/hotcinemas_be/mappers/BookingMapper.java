package com.example.hotcinemas_be.mappers;

import com.example.hotcinemas_be.dtos.booking.responses.BookingResponse;
import com.example.hotcinemas_be.dtos.booking.responses.BookingItemResponse;
import com.example.hotcinemas_be.models.Booking;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class BookingMapper {

    public BookingResponse mapToResponse(Booking booking) throws  Exception {
        if (booking == null) {
            return null;
        }

        return BookingResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .status(booking.getStatus())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .showtimeId(booking.getShowtime() != null ?  booking.getShowtime().getId() : null)
                .movieFormat(booking.getShowtime() != null && booking.getShowtime().getFormat() != null ? booking.getShowtime().getFormat().getValue() : null)
                .movieAudioType(booking.getShowtime() != null && booking.getShowtime().getAudioType() != null ? booking.getShowtime().getAudioType().getValue() : null)
                .movieTitle(booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getTitle() : null)
                .moviePosterUrl(booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getPosterUrl() : null)
                .cinemaName(booking.getShowtime() != null && booking.getShowtime().getTheater() != null && booking.getShowtime().getTheater().getCinema() != null ? booking.getShowtime().getTheater().getCinema().getName() : null)
                .cinemaAddress(booking.getShowtime() != null && booking.getShowtime().getTheater() != null && booking.getShowtime().getTheater().getCinema() != null ? booking.getShowtime().getTheater().getCinema().getAddress() : null)
                .roomName(booking.getShowtime() != null && booking.getShowtime().getTheater() != null ? booking.getShowtime().getTheater().getName() : null)
                .showtimeDateTime(booking.getShowtime() != null ? booking.getShowtime().getShowDate() : null)
                .showtimeStartTime(booking.getShowtime() != null ? booking.getShowtime().getStartTime() : null)
                .showtimeEndTime(booking.getShowtime() != null ? booking.getShowtime().getEndTime() : null)
                .totalAmount(booking.getTotalAmount())
                .discountAmount(booking.getDiscountAmount())
                .finalAmount(booking.getFinalAmount())
                .seats(booking.getSeatSnapshots())
                .bookingDate(booking.getBookingDate())
                .build();
    }

    public BookingItemResponse mapToItemResponse(Booking booking) {
        if (booking == null) {
            return null;
        }

        return BookingItemResponse.builder()
                .id(booking.getId())
                .showtimeId(booking.getShowtime() != null ? booking.getShowtime().getId() : null)
                .bookingCode(booking.getBookingCode())
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .userFullName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .userEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .movieTitle(booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getTitle() : null)
                .posterUrl(booking.getShowtime() != null && booking.getShowtime().getMovie() != null ? booking.getShowtime().getMovie().getPosterUrl() : null)
                .cinemaName(booking.getShowtime() != null && booking.getShowtime().getTheater() != null && booking.getShowtime().getTheater().getCinema() != null ? booking.getShowtime().getTheater().getCinema().getName() : null)
                .roomName(booking.getShowtime() != null && booking.getShowtime().getTheater() != null ? booking.getShowtime().getTheater().getName() : null)
                .showDate(booking.getShowtime() != null ? booking.getShowtime().getShowDate() : null)
                .startTime(booking.getShowtime() != null ? booking.getShowtime().getStartTime() : null)
                .endTime(booking.getShowtime() != null ? booking.getShowtime().getEndTime() : null)
                .finalAmount(booking.getFinalAmount())
                .bookingStatus(booking.getStatus())
                .seats(booking.getSeatSnapshots())
                .bookingDate(booking.getBookingDate())
                .build();
    }
}
