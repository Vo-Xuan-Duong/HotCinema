package com.example.hotcinemas_be.dtos.booking.responses;

import com.example.hotcinemas_be.dtos.seat.SeatSnapshot;
import com.example.hotcinemas_be.enums.BookingStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BookingItemResponse {
    private Long id;
    private Long showtimeId;
    private String bookingCode;
    private Long userId;
    private String userFullName;
    private String userEmail;
    private String movieTitle;
    private String posterUrl;
    private String cinemaName;
    private String roomName;
    private LocalDate showDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private BigDecimal finalAmount;
    private BookingStatus bookingStatus;
    private List<SeatSnapshot> seats;
    private LocalDateTime bookingDate;
}
