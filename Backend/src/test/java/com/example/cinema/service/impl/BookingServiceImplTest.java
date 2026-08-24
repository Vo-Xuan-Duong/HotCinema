package com.example.cinema.service.impl;

import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Showtime;
import com.example.cinema.entity.User;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertSame;
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
}
