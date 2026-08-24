package com.example.cinema.service;

import com.example.cinema.entity.Booking;
import com.example.cinema.entity.BookingSeat;
import com.example.cinema.entity.Ticket;
import com.example.cinema.entity.enums.TicketStatus;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.TicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TicketIssuanceService {

    private final BookingSeatRepository bookingSeatRepository;
    private final TicketRepository ticketRepository;

    @Transactional
    public void issueTickets(Booking booking, ZonedDateTime issuedAt) {
        List<BookingSeat> bookingSeats = bookingSeatRepository.findAllByBooking_Id(booking.getId());
        for (BookingSeat bookingSeat : bookingSeats) {
            if (ticketRepository.existsByBookingSeat_IdAndIsActiveTrue(bookingSeat.getId())) {
                continue;
            }

            Ticket ticket = Ticket.builder()
                    .ticketCode(generateTicketCode())
                    .booking(booking)
                    .bookingSeat(bookingSeat)
                    .qrToken(UUID.randomUUID())
                    .status(TicketStatus.VALID)
                    .issuedAt(issuedAt)
                    .build();
            ticketRepository.save(ticket);
        }
    }

    private String generateTicketCode() {
        return "TKT-" + UUID.randomUUID().toString().replace("-", "")
                .substring(0, 20)
                .toUpperCase(Locale.ROOT);
    }
}
