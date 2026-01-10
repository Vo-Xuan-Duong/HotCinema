package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.booking.requests.BookingRequest;
import com.example.hotcinemas_be.dtos.booking.responses.BookingItemResponse;
import com.example.hotcinemas_be.dtos.booking.responses.BookingResponse;
import com.example.hotcinemas_be.dtos.seat.SeatSnapshot;
import com.example.hotcinemas_be.enums.BookingStatus;
import com.example.hotcinemas_be.enums.SeatType;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.mappers.BookingMapper;
import com.example.hotcinemas_be.models.*;
import com.example.hotcinemas_be.repositorys.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final PromotionRepository promotionRepository;
    private final BookingMapper bookingMapper;
    private final AuthService authService;
    private final PromotionService promotionService;
    private final RedisService redisService;

    public BookingResponse createBooking(BookingRequest bookingRequest) {
        log.info("Creating booking for showtime: {} with seats: {}",
                bookingRequest.getShowtimeId(), bookingRequest.getSeatIds());

        User currentUser = authService.getCurrentUser();

        Showtime showtime = showtimeRepository.findById(bookingRequest.getShowtimeId())
                .orElseThrow(() -> new AppException("Showtime not found", ErrorCode.SHOWTIME_NOT_FOUND));

        // Validate seat locks
        for (Long seatId : bookingRequest.getSeatIds()) {
            String key = "seat_lock:showtime_" + showtime.getId() + ":seat_" + seatId;
            Object lockedBy = redisService.get(key);
            if (lockedBy == null || !lockedBy.toString().equals(currentUser.getId().toString())) {
                throw new AppException("Seat " + seatId + " is not locked by you or lock has expired",
                        ErrorCode.SEAT_NOT_LOCKED_BY_USER);
            }
        }

        BigDecimal totalAmount = totalAmountSeats(bookingRequest.getSeatIds(), showtime);

        BigDecimal discountAmount = promotionService.calculateDiscount(bookingRequest.getPromotionCode(), totalAmount);

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);

        List<SeatSnapshot> seatSnapshots = bookingRequest.getSeatIds().stream().map(
                seatId -> {
                    Seat seat = seatRepository.findById(seatId)
                            .orElseThrow(() -> new AppException("Seat not found", ErrorCode.SEAT_NOT_FOUND));
                    return SeatSnapshot.builder()
                            .seatId(seat.getId())
                            .seatName(seat.getName())
                            .price(getPriceForSeat(seat, showtime))
                            .seatType(seat.getSeatType().name())
                            .build();
                }).toList();

        Booking booking = Booking.builder()
                .user(currentUser)
                .showtime(showtime)
                .bookingCode(generateBookingCode())
                .bookingDate(LocalDateTime.now())
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .status(BookingStatus.PENDING)
                .seatSnapshots(seatSnapshots)
                .build();
        booking = bookingRepository.save(booking);

        try {
            return bookingMapper.mapToResponse(booking);
        } catch (Exception e) {
            throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new AppException("Booking not found", ErrorCode.BOOKING_NOT_FOUND));
        try {
            return bookingMapper.mapToResponse(booking);
        } catch (Exception e) {
            throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingByCode(String bookingCode) {
        Booking booking = bookingRepository.findByBookingCode(bookingCode)
                .orElseThrow(() -> new AppException("Booking not found", ErrorCode.BOOKING_NOT_FOUND));
        try {
            return bookingMapper.mapToResponse(booking);
        } catch (Exception e) {
            throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
        }
    }

    @Transactional(readOnly = true)
    public Page<BookingItemResponse> getAllBookings(Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findAll(pageable);
        return bookings.map(
                booking -> {
                    try {
                        return bookingMapper.mapToItemResponse(booking);
                    } catch (Exception e) {
                        throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
                    }
                });
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByUserId(Long userId) {
        List<Booking> bookings = bookingRepository.findBookingsByUserId(userId);
        return bookings.stream().map(
                booking -> {
                    try {
                        return bookingMapper.mapToResponse(booking);
                    } catch (Exception e) {
                        throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
                    }
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByShowtimeId(Long showtimeId) {
        List<Booking> bookings = bookingRepository.findBookingsByShowtimeId(showtimeId);
        return bookings.stream().map(
                booking -> {
                    try {
                        return bookingMapper.mapToResponse(booking);
                    } catch (Exception e) {
                        throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
                    }
                }).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        List<Booking> bookings = bookingRepository.findBookingsByStatus(status);
        return bookings.stream().map(
                booking -> {
                    try {
                        return bookingMapper.mapToResponse(booking);
                    } catch (Exception e) {
                        throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
                    }
                }).toList();
    }

    private BigDecimal totalAmountSeats(List<Long> seatIds, Showtime showtime) {
        List<Seat> seats = seatRepository.findAllById(seatIds);
        BigDecimal total = BigDecimal.ZERO;
        for (Seat seat : seats) {
            total = total.add(getPriceForSeat(seat, showtime));
        }
        return total;
    }

    public BigDecimal getPriceForSeat(Seat seat, Showtime showtime) {
        if (seat.getSeatType() == SeatType.COUPLE) {
            return showtime.getBasePrice().multiply(BigDecimal.valueOf(2));
        } else if (seat.getSeatType() == SeatType.VIP) {
            BigDecimal price = showtime.getBasePrice();
            return price.multiply(new BigDecimal("1.1"));
        } else {
            return showtime.getBasePrice();
        }
    }

    private String generateBookingCode() {
        long timestamp = System.currentTimeMillis() / 1000;

        String timeCode = Long.toString(timestamp, 36).toUpperCase();

        int randomPart = (int) (Math.random() * 90 + 10);

        return "BK" + timeCode + randomPart; // Kết quả ví dụ: BK1Z4F9825
    }

    public BookingResponse updateBookingStatus(Long id, BookingStatus status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking not found", ErrorCode.BOOKING_NOT_FOUND));
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new AppException("Cannot update booking status", ErrorCode.INVALID_REQUEST);
        }
        booking.setStatus(status);
        booking = bookingRepository.save(booking);
        log.info("Booking {} updated successfully", booking.getId());
        try {
            return bookingMapper.mapToResponse(booking);
        } catch (Exception e) {
            throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
        }
    }

    public void deleteBooking(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new AppException("Booking not found", ErrorCode.BOOKING_NOT_FOUND));
        bookingRepository.delete(booking);
    }

    public Page<BookingItemResponse> getBookingHistoryByUserId(Long userId, Pageable pageable) {
        Page<Booking> bookings = bookingRepository.findBookingsByUserIdOrderByBookingDateDesc(userId, pageable);
        return bookings.map(
                booking -> {
                    try {
                        return bookingMapper.mapToItemResponse(booking);
                    } catch (Exception e) {
                        throw new AppException("Error mapping booking to response", ErrorCode.BOOKING_NOT_FOUND);
                    }
                });
    }
}