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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        for (BookingSeat bookingSeat : bookingSeats) {
            ShowtimeSeat showtimeSeat = bookingSeat.getShowtimeSeat();
            if (showtimeSeat == null || showtimeSeat.getBooking() == null
                    || !bookingId.equals(showtimeSeat.getBooking().getId())) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking seat ownership is inconsistent");
            }
            if (showtimeSeat.getStatus() != ShowtimeSeatStatus.HELD) {
                throw new AppException(
                        ErrorCode.DATA_INTEGRITY_VIOLATION,
                        "Booking seats can no longer be released safely"
                );
            }
        }

        bookingSeatRepository.deleteAll(bookingSeats);
        for (BookingSeat bookingSeat : bookingSeats) {
            ShowtimeSeat showtimeSeat = bookingSeat.getShowtimeSeat();
            showtimeSeat.setBooking(null);
            showtimeSeat.setStatus(ShowtimeSeatStatus.AVAILABLE);
            showtimeSeat.setHeldByUser(null);
            showtimeSeat.setHoldToken(null);
            showtimeSeat.setHeldAt(null);
            showtimeSeat.setHoldExpiresAt(null);
        }
        showtimeSeatRepository.saveAll(bookingSeats.stream().map(BookingSeat::getShowtimeSeat).toList());

        List<BookingPromotion> bookingPromotions = bookingPromotionRepository.findAllByBooking_Id(bookingId);
        for (BookingPromotion bookingPromotion : bookingPromotions) {
            PromotionCode promotionCode = bookingPromotion.getPromotionCode();
            if (promotionCode != null) {
                int usedCount = promotionCode.getUsedCount() == null ? 0 : promotionCode.getUsedCount();
                promotionCode.setUsedCount(Math.max(0, usedCount - 1));
                promotionCodeRepository.save(promotionCode);
            }
        }
        bookingPromotionRepository.deleteAll(bookingPromotions);

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(ZonedDateTime.now());
        return bookingMapper.toResponse(bookingRepository.save(booking));
    }
}
