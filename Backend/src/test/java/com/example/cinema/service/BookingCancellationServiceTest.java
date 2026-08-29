package com.example.cinema.service;

import com.example.cinema.entity.Booking;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingPromotionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingCancellationServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingSeatRepository bookingSeatRepository;
    @Mock
    private BookingPromotionRepository bookingPromotionRepository;
    @Mock
    private PromotionCodeRepository promotionCodeRepository;
    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;
    @Mock
    private BookingMapper bookingMapper;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private BookingCancellationService service;

    @Test
    void paidBookingCannotBeCancelledDirectly() {
        UUID bookingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Booking booking = org.mockito.Mockito.mock(Booking.class);

        when(bookingRepository.findByIdAndUserIdForUpdate(bookingId, userId))
                .thenReturn(Optional.of(booking));
        when(booking.getStatus()).thenReturn(BookingStatus.CONFIRMED);

        assertThrows(AppException.class, () -> service.cancelForUser(bookingId, userId));

        verifyNoInteractions(
                bookingSeatRepository,
                bookingPromotionRepository,
                promotionCodeRepository,
                showtimeSeatRepository,
                bookingMapper,
                messagingTemplate
        );
    }

    @Test
    void refundedBookingCannotBeCancelledDirectly() {
        UUID bookingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Booking booking = org.mockito.Mockito.mock(Booking.class);

        when(bookingRepository.findByIdAndUserIdForUpdate(bookingId, userId))
                .thenReturn(Optional.of(booking));
        when(booking.getStatus()).thenReturn(BookingStatus.REFUNDED);

        assertThrows(AppException.class, () -> service.cancelForUser(bookingId, userId));

        verifyNoInteractions(
                bookingSeatRepository,
                bookingPromotionRepository,
                promotionCodeRepository,
                showtimeSeatRepository,
                bookingMapper,
                messagingTemplate
        );
    }
}
