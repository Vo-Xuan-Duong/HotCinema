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
public class BookingDetailResponse {
    private Long id;
    private String bookingCode;
    private String qrCodeBase64;
    private BookingStatus status;
    private Long userId;
    private String userName;
    private String userEmail;
    private Long showtimeId;
    private String movieFormat;
    private String movieAudioType;
    private String movieTitle;
    private String moviePosterUrl;
    private String cinemaName;
    private String cinemaAddress;
    private String roomName;
    private LocalDate showtimeDateTime;
    private LocalTime showtimeStartTime;
    private LocalTime showtimeEndTime;
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private List<SeatSnapshot> seats;
    private LocalDateTime bookingDate;
}
