package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.enums.BookingStatus;
import com.example.hotcinemas_be.models.Booking;
import com.example.hotcinemas_be.repositorys.BookingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookingCleanupService {

    private final BookingRepository bookingRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    @Transactional
    public void cancelUnpaidBookings() {
        LocalDateTime timeLimit = LocalDateTime.now().minusMinutes(15);
        List<Booking> expiredBookings = bookingRepository.findByStatusAndCreatedAtBefore(BookingStatus.PENDING,
                timeLimit);

        if (!expiredBookings.isEmpty()) {
            log.info("Found {} expired bookings to cancel", expiredBookings.size());
            for (Booking booking : expiredBookings) {
                booking.setStatus(BookingStatus.CANCELLED);
                log.info("Cancelled expired booking: {}", booking.getBookingCode());
            }
            bookingRepository.saveAll(expiredBookings);
        }
    }
}
