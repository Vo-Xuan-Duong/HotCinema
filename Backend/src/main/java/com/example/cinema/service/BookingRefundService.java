package com.example.cinema.service;

import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Payment;
import com.example.cinema.entity.PaymentTransaction;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.Ticket;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.entity.enums.PaymentProvider;
import com.example.cinema.entity.enums.PaymentStatus;
import com.example.cinema.entity.enums.PaymentTransactionStatus;
import com.example.cinema.entity.enums.PaymentTransactionType;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.entity.enums.TicketStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.repository.PaymentTransactionRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.repository.TicketRepository;
import com.example.cinema.service.payment.MomoPaymentGatewayClient;
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
public class BookingRefundService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final TicketRepository ticketRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final MomoPaymentGatewayClient momoPaymentGatewayClient;
    private final BookingMapper bookingMapper;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    @CacheEvict(value = {"bookings", "payments", "tickets", "showtimeseats"}, allEntries = true)
    public BookingResponse refundForUser(UUID bookingId, UUID userId) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(bookingId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingId.toString()));

        if (booking.getStatus() == BookingStatus.REFUNDED) {
            return bookingMapper.toResponse(booking);
        }
        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.PAID) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Only paid bookings can be refunded");
        }

        ZonedDateTime now = ZonedDateTime.now();
        if (booking.getShowtime() == null || booking.getShowtime().getStartTime() == null) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking showtime is missing");
        }
        if (!booking.getShowtime().getStartTime().isAfter(now)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Bookings cannot be refunded after the showtime has started");
        }

        Payment payment = paymentRepository
                .findFirstByBooking_IdAndProviderAndStatusAndIsActiveTrueOrderByCreatedAtDesc(
                        bookingId,
                        PaymentProvider.MOMO,
                        PaymentStatus.SUCCESS
                )
                .orElseThrow(() -> new AppException(
                        ErrorCode.BAD_REQUEST,
                        "No successful MoMo payment was found for this booking"
                ));

        List<Ticket> tickets = ticketRepository.findAllForUpdateByBooking_IdAndIsActiveTrue(bookingId);
        for (Ticket ticket : tickets) {
            if (ticket.getStatus() == TicketStatus.USED || ticket.getCheckedInAt() != null) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Checked-in tickets cannot be refunded");
            }
            if (ticket.getStatus() != TicketStatus.VALID) {
                throw new AppException(ErrorCode.BAD_REQUEST, "A ticket is not in a refundable state");
            }
        }

        List<ShowtimeSeat> seats = showtimeSeatRepository.findAllByBookingIdForUpdate(bookingId);
        if (seats.isEmpty()) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking has no reserved seats");
        }
        for (ShowtimeSeat seat : seats) {
            if (seat.getBooking() == null
                    || !bookingId.equals(seat.getBooking().getId())
                    || seat.getStatus() != ShowtimeSeatStatus.BOOKED) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking seat state is inconsistent");
            }
        }

        String compactPaymentId = payment.getId().toString().replace("-", "");
        String refundOrderId = "HCRF" + compactPaymentId;
        String refundRequestId = "HCRFR" + compactPaymentId;
        MomoPaymentGatewayClient.MomoRefundResult gateway = momoPaymentGatewayClient.refundPayment(
                payment,
                refundOrderId,
                refundRequestId
        );

        paymentTransactionRepository.save(PaymentTransaction.builder()
                .payment(payment)
                .transactionType(PaymentTransactionType.REFUND)
                .providerTransactionId(gateway.refundTransactionId())
                .amount(payment.getAmount())
                .status(PaymentTransactionStatus.SUCCESS)
                .requestPayload("{\"orderId\":\"" + refundOrderId
                        + "\",\"requestId\":\"" + refundRequestId
                        + "\",\"amount\":" + payment.getAmount().toPlainString() + "}")
                .responsePayload(gateway.responsePayload())
                .createdAt(now)
                .build());

        for (Ticket ticket : tickets) {
            ticket.setStatus(TicketStatus.REFUNDED);
        }
        ticketRepository.saveAll(tickets);

        for (ShowtimeSeat seat : seats) {
            seat.setBooking(null);
            seat.setStatus(ShowtimeSeatStatus.AVAILABLE);
            seat.setHeldByUser(null);
            seat.setHoldToken(null);
            seat.setHeldAt(null);
            seat.setHoldExpiresAt(null);
        }
        showtimeSeatRepository.saveAll(seats);
        for (ShowtimeSeat seat : seats) {
            publishSeatAvailableAfterCommit(seat.getShowtime().getId(), seat.getId());
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setPaymentUrl(null);
        paymentRepository.save(payment);

        booking.setStatus(BookingStatus.REFUNDED);
        booking.setCancelledAt(now);
        return bookingMapper.toResponse(bookingRepository.save(booking));
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
