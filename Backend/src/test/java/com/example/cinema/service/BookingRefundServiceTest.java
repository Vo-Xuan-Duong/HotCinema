package com.example.cinema.service;

import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Showtime;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingItemRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.CinemaProductRepository;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.repository.PaymentTransactionRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.repository.TicketRepository;
import com.example.cinema.service.payment.MomoPaymentGatewayClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingRefundServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private BookingItemRepository bookingItemRepository;
    @Mock
    private CinemaProductRepository cinemaProductRepository;
    @Mock
    private PaymentRepository paymentRepository;
    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;
    @Mock
    private MomoPaymentGatewayClient momoPaymentGatewayClient;
    @Mock
    private BookingMapper bookingMapper;
    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private BookingRefundService service;

    @Test
    void unpaidBookingCannotBeRefunded() {
        UUID bookingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Booking booking = org.mockito.Mockito.mock(Booking.class);

        when(bookingRepository.findByIdAndUserIdForUpdate(bookingId, userId))
                .thenReturn(Optional.of(booking));
        when(booking.getStatus()).thenReturn(BookingStatus.PENDING_PAYMENT);

        assertThrows(AppException.class, () -> service.refundForUser(bookingId, userId));

        verifyNoInteractions(
                bookingItemRepository,
                cinemaProductRepository,
                paymentRepository,
                paymentTransactionRepository,
                ticketRepository,
                showtimeSeatRepository,
                momoPaymentGatewayClient,
                bookingMapper,
                messagingTemplate
        );
    }

    @Test
    void startedShowtimeCannotBeRefunded() {
        UUID bookingId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();
        Booking booking = org.mockito.Mockito.mock(Booking.class);
        Showtime showtime = org.mockito.Mockito.mock(Showtime.class);

        when(bookingRepository.findByIdAndUserIdForUpdate(bookingId, userId))
                .thenReturn(Optional.of(booking));
        when(booking.getStatus()).thenReturn(BookingStatus.CONFIRMED);
        when(booking.getShowtime()).thenReturn(showtime);
        when(showtime.getStartTime()).thenReturn(ZonedDateTime.now().minusMinutes(1));

        assertThrows(AppException.class, () -> service.refundForUser(bookingId, userId));

        verifyNoInteractions(
                bookingItemRepository,
                cinemaProductRepository,
                paymentRepository,
                paymentTransactionRepository,
                ticketRepository,
                showtimeSeatRepository,
                momoPaymentGatewayClient,
                bookingMapper,
                messagingTemplate
        );
    }
}
