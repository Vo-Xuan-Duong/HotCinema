package com.example.cinema.service.impl;

import com.example.cinema.dto.booking.BookingCheckoutRequest;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Seat;
import com.example.cinema.entity.SeatType;
import com.example.cinema.entity.Showtime;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingPromotionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingMapper bookingMapper;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;

    @Mock
    private BookingSeatRepository bookingSeatRepository;

    @Mock
    private PromotionCodeRepository promotionCodeRepository;

    @Mock
    private BookingPromotionRepository bookingPromotionRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createForUserResolvesOwnerAndShowtimeRelations() {
        UUID userId = UUID.randomUUID();
        UUID showtimeId = UUID.randomUUID();
        BookingCreateRequest request = BookingCreateRequest.builder()
                .showtimeId(showtimeId)
                .build();

        Booking entity = new Booking();
        User user = mock(User.class);
        Showtime showtime = mock(Showtime.class);
        BookingResponse response = new BookingResponse();

        when(bookingMapper.toEntity(request)).thenReturn(entity);
        when(userRepository.findByIdAndIsActiveTrue(userId)).thenReturn(Optional.of(user));
        when(showtimeRepository.findByIdAndIsActiveTrue(showtimeId)).thenReturn(Optional.of(showtime));
        when(bookingRepository.save(entity)).thenReturn(entity);
        when(bookingMapper.toResponse(entity)).thenReturn(response);

        BookingResponse result = bookingService.createForUser(request, userId);

        assertSame(response, result);
        assertSame(user, entity.getUser());
        assertSame(showtime, entity.getShowtime());
        verify(bookingRepository).save(entity);
    }

    @Test
    void checkoutBuildsTrustedBookingFromHeldSeatPrice() {
        UUID userId = UUID.randomUUID();
        UUID showtimeId = UUID.randomUUID();
        UUID showtimeSeatId = UUID.randomUUID();
        ZonedDateTime holdExpiresAt = ZonedDateTime.now().plusMinutes(5);

        User user = new User();
        user.setId(userId);
        user.setFullName("Customer");
        user.setEmail("customer@example.com");
        user.setPhone("0900000000");

        Showtime showtime = new Showtime();
        showtime.setId(showtimeId);

        SeatType seatType = SeatType.builder().name("Standard").code("STANDARD").build();
        Seat seat = Seat.builder()
                .displayName("A1")
                .rowLabel("A")
                .seatNumber(1)
                .seatType(seatType)
                .build();

        ShowtimeSeat showtimeSeat = ShowtimeSeat.builder()
                .showtime(showtime)
                .seat(seat)
                .price(new BigDecimal("120000"))
                .status(ShowtimeSeatStatus.HELD)
                .heldByUser(user)
                .holdExpiresAt(holdExpiresAt)
                .build();
        showtimeSeat.setId(showtimeSeatId);

        BookingCheckoutRequest request = BookingCheckoutRequest.builder()
                .seatIds(List.of(showtimeSeatId))
                .build();
        BookingResponse response = new BookingResponse();

        when(userRepository.findByIdAndIsActiveTrue(userId)).thenReturn(Optional.of(user));
        when(showtimeSeatRepository.findByIdForUpdate(showtimeSeatId)).thenReturn(Optional.of(showtimeSeat));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(bookingMapper.toResponse(any(Booking.class))).thenReturn(response);

        BookingResponse result = bookingService.checkout(userId, request);

        ArgumentCaptor<Booking> bookingCaptor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(bookingCaptor.capture());
        Booking saved = bookingCaptor.getValue();

        assertSame(response, result);
        assertEquals(BookingStatus.PENDING_PAYMENT, saved.getStatus());
        assertEquals(new BigDecimal("120000.00"), saved.getSeatAmount());
        assertEquals(new BigDecimal("120000.00"), saved.getTotalAmount());
        assertEquals("VND", saved.getCurrency());
        assertSame(user, saved.getUser());
        assertSame(showtime, saved.getShowtime());
        assertSame(saved, showtimeSeat.getBooking());
        verify(showtimeSeatRepository).saveAll(List.of(showtimeSeat));
    }
}
