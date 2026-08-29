package com.example.cinema.service;

import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.BookingPromotion;
import com.example.cinema.entity.BookingSeat;
import com.example.cinema.entity.PromotionCode;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingPromotionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingCancellationService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingPromotionRepository bookingPromotionRepository;
    private final PromotionCodeRepository promotionCodeRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final BookingMapper bookingMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @CacheEvict(value = {"bookings", "showtimeseats"}, allEntries = true)
    public BookingResponse cancelForUser(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId.toString()));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return bookingMapper.toResponse(booking);
        }

        if (booking.getStatus() != BookingStatus.PENDING
                && booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(
                    ErrorCode.BAD_REQUEST,
                    "Only unpaid bookings can be cancelled directly. Paid bookings must use the refund flow"
            );
        }

        List<BookingSeat> bookingSeats = bookingSeatRepository.findAllByBooking_Id(bookingId);
        List<ShowtimeSeat> showtimeSeats = showtimeSeatRepository.findAllByBookingIdForUpdate(bookingId);

        if (bookingSeats.size() != showtimeSeats.size()) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking seat data is inconsistent");
        }

        for (ShowtimeSeat showtimeSeat : showtimeSeats) {
            if (showtimeSeat.getBooking() == null || !bookingId.equals(showtimeSeat.getBooking().getId())) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking seat ownership is inconsistent");
            }
            if (showtimeSeat.getStatus() != ShowtimeSeatStatus.HELD) {
                throw new AppException(
                        ErrorCode.DATA_INTEGRITY_VIOLATION,
                        "Booking seats can no longer be released safely"
                );
            }
        }

        bookingSeatRepository.deleteAllByBooking_Id(bookingId);
        for (ShowtimeSeat showtimeSeat : showtimeSeats) {
            showtimeSeat.setBooking(null);
            clearHold(showtimeSeat);
        }
        showtimeSeatRepository.saveAll(showtimeSeats);
        for (ShowtimeSeat showtimeSeat : showtimeSeats) {
            publishSeatAvailableAfterCommit(showtimeSeat.getShowtime().getId(), showtimeSeat.getId());
        }

        releasePromotionReservation(bookingId);

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(ZonedDateTime.now());
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    private void releasePromotionReservation(UUID bookingId) {
        List<BookingPromotion> reservations = bookingPromotionRepository.findAllByBooking_Id(bookingId);
        for (BookingPromotion reservation : reservations) {
            PromotionCode code = reservation.getPromotionCode();
            if (code == null) {
                continue;
            }
            PromotionCode lockedCode = promotionCodeRepository.findByIdForUpdate(code.getId()).orElse(code);
            int usedCount = lockedCode.getUsedCount() == null ? 0 : lockedCode.getUsedCount();
            if (usedCount > 0) {
                lockedCode.setUsedCount(usedCount - 1);
                promotionCodeRepository.save(lockedCode);
            }
        }
        bookingPromotionRepository.deleteAllByBooking_Id(bookingId);
    }

    private void clearHold(ShowtimeSeat showtimeSeat) {
        showtimeSeat.setStatus(ShowtimeSeatStatus.AVAILABLE);
        showtimeSeat.setHeldByUser(null);
        showtimeSeat.setHoldToken(null);
        showtimeSeat.setHeldAt(null);
        showtimeSeat.setHoldExpiresAt(null);
    }

    private void publishSeatAvailableAfterCommit(UUID showtimeId, UUID seatId) {
        Runnable publish = () -> messagingTemplate.convertAndSend(
                "/topic/showtimes/" + showtimeId,
                new SeatStatusEvent(seatId, ShowtimeSeatStatus.AVAILABLE.name(), null)
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publish.run();
                }
            });
        } else {
            publish.run();
        }
    }

    private record SeatStatusEvent(UUID seatId, String status, UUID userId) {}
}
