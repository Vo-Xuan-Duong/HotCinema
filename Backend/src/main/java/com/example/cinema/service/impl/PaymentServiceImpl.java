package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.payment.PaymentCreateRequest;
import com.example.cinema.dto.payment.PaymentInitiateRequest;
import com.example.cinema.dto.payment.PaymentResponse;
import com.example.cinema.dto.payment.PaymentUpdateRequest;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.Payment;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.entity.enums.PaymentProvider;
import com.example.cinema.entity.enums.PaymentStatus;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.PaymentMapper;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.PaymentRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.service.PaymentService;
import com.example.cinema.service.TicketIssuanceService;
import com.example.cinema.service.payment.MomoPaymentGatewayClient;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository repository;
    private final PaymentMapper paymentMapper;
    private final BookingRepository bookingRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final TicketIssuanceService ticketIssuanceService;
    private final MomoPaymentGatewayClient momoPaymentGatewayClient;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findAll() {
        return paymentMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(paymentMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PaymentResponse> findByStatus(PaymentStatus status, Pageable pageable) {
        return PageMapper.toPageResponse(
                repository.findAllByStatusAndIsActiveTrue(status, pageable).map(paymentMapper::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "payments", key = "#id")
    public PaymentResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse findByIdForUser(UUID id, UUID userId) {
        return repository.findByIdAndBooking_User_IdAndIsActiveTrue(id, userId)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findByBookingId(UUID bookingId) {
        return paymentMapper.toResponseList(repository.findAllByBooking_IdAndIsActiveTrue(bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> findByBookingIdForUser(UUID bookingId, UUID userId) {
        return paymentMapper.toResponseList(
                repository.findAllByBooking_IdAndBooking_User_IdAndIsActiveTrue(bookingId, userId)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse findByTransactionId(String transactionId) {
        return repository.findByProviderTransactionIdAndIsActiveTrue(transactionId)
                .map(paymentMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction", transactionId));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse initiate(PaymentInitiateRequest request, UUID userId) {
        Booking booking = bookingRepository.findByIdAndUserIdForUpdate(request.getBookingId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId().toString()));
        validateBookingCanBePaid(booking);

        if (request.getProvider() != PaymentProvider.MOMO) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Payment provider is not enabled for live checkout");
        }
        if (!"VND".equalsIgnoreCase(booking.getCurrency())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "MoMo checkout only supports VND bookings");
        }

        String idempotencyKey = PaymentProvider.MOMO.name() + ":" + booking.getId();
        Payment entity = repository.findByIdempotencyKeyAndIsActiveTrue(idempotencyKey).orElse(null);
        if (entity != null
                && entity.getStatus() == PaymentStatus.PENDING
                && entity.getPaymentUrl() != null
                && !entity.getPaymentUrl().isBlank()) {
            return paymentMapper.toResponse(entity);
        }

        String orderId = momoPaymentGatewayClient.newProviderId("HC");
        String requestId = momoPaymentGatewayClient.newProviderId("HCR");
        MomoPaymentGatewayClient.MomoCreateResult gateway =
                momoPaymentGatewayClient.createPayment(booking, orderId, requestId);

        if (entity == null) {
            entity = Payment.builder()
                    .booking(booking)
                    .provider(PaymentProvider.MOMO)
                    .paymentMethod(PaymentProvider.MOMO.name())
                    .amount(booking.getTotalAmount())
                    .currency(booking.getCurrency())
                    .status(PaymentStatus.PENDING)
                    .idempotencyKey(idempotencyKey)
                    .build();
        }

        entity.setBooking(booking);
        entity.setProvider(PaymentProvider.MOMO);
        entity.setPaymentMethod(PaymentProvider.MOMO.name());
        entity.setAmount(booking.getTotalAmount());
        entity.setCurrency(booking.getCurrency());
        entity.setStatus(PaymentStatus.PENDING);
        entity.setProviderOrderId(gateway.orderId());
        entity.setRequestId(gateway.requestId());
        entity.setPaymentUrl(gateway.paymentUrl());
        entity.setProviderTransactionId(null);
        entity.setFailureCode(null);
        entity.setFailureMessage(null);
        entity.setPaidAt(null);

        return paymentMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse create(PaymentCreateRequest request) {
        Booking booking = bookingRepository.findByIdAndIsActiveTrue(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId().toString()));
        return createInternal(request, booking, false);
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse createForUser(PaymentCreateRequest request, UUID userId) {
        Booking booking = bookingRepository.findByIdAndUser_IdAndIsActiveTrue(request.getBookingId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId().toString()));
        validateBookingCanBePaid(booking);
        return createInternal(request, booking, true);
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse update(UUID id, PaymentUpdateRequest request) {
        Payment entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
        Booking booking = bookingRepository.findByIdAndIsActiveTrue(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", request.getBookingId().toString()));

        validatePaymentAgainstBooking(request.getAmount(), request.getCurrency(), booking);
        paymentMapper.updateEntityFromRequest(request, entity);
        entity.setBooking(booking);
        return paymentMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"payments", "bookings", "showtimeseats", "tickets"}, allEntries = true)
    public PaymentResponse updateStatus(UUID id, PaymentStatus status) {
        Payment entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));

        if (entity.getStatus() == PaymentStatus.SUCCESS && status == PaymentStatus.SUCCESS) {
            return paymentMapper.toResponse(entity);
        }

        if (status == PaymentStatus.SUCCESS) {
            finalizeSuccessfulPayment(entity);
        } else {
            entity.setStatus(status);
        }
        return paymentMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", allEntries = true)
    public PaymentResponse updateTransactionId(UUID id, String transactionId) {
        Payment entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id.toString()));
        entity.setProviderTransactionId(transactionId);
        return paymentMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "payments", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }

    private PaymentResponse createInternal(PaymentCreateRequest request, Booking booking, boolean forcePending) {
        Payment existing = repository.findByIdempotencyKeyAndIsActiveTrue(request.getIdempotencyKey()).orElse(null);
        if (existing != null) {
            if (!existing.getBooking().getId().equals(booking.getId())) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Idempotency key is already associated with another booking");
            }
            return paymentMapper.toResponse(existing);
        }

        validatePaymentAgainstBooking(request.getAmount(), request.getCurrency(), booking);
        Payment entity = paymentMapper.toEntity(request);
        entity.setBooking(booking);
        if (forcePending) {
            entity.setStatus(PaymentStatus.PENDING);
            entity.setPaidAt(null);
            entity.setProviderTransactionId(null);
            entity.setFailureCode(null);
            entity.setFailureMessage(null);
        }
        return paymentMapper.toResponse(repository.save(entity));
    }

    private void finalizeSuccessfulPayment(Payment payment) {
        Booking booking = payment.getBooking();
        if (booking == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Payment is not associated with a booking");
        }

        ZonedDateTime now = ZonedDateTime.now();
        if (booking.getStatus() == BookingStatus.CONFIRMED || booking.getStatus() == BookingStatus.PAID) {
            payment.setStatus(PaymentStatus.SUCCESS);
            if (payment.getPaidAt() == null) {
                payment.setPaidAt(now);
            }
            ticketIssuanceService.issueTickets(booking, payment.getPaidAt());
            return;
        }
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Booking cannot be paid in its current state");
        }
        if (booking.getExpiresAt() != null && !booking.getExpiresAt().isAfter(now)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Booking has expired");
        }

        List<ShowtimeSeat> seats = showtimeSeatRepository.findAllByBookingIdForUpdate(booking.getId());
        if (seats.isEmpty()) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Booking has no reserved seats");
        }

        for (ShowtimeSeat seat : seats) {
            if (seat.getStatus() != ShowtimeSeatStatus.HELD
                    || seat.getHeldByUser() == null
                    || booking.getUser() == null
                    || !booking.getUser().getId().equals(seat.getHeldByUser().getId())
                    || seat.getHoldExpiresAt() == null
                    || !seat.getHoldExpiresAt().isAfter(now)) {
                throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "A reserved seat is no longer valid");
            }
            seat.setStatus(ShowtimeSeatStatus.BOOKED);
            seat.setHeldByUser(null);
            seat.setHoldToken(null);
            seat.setHeldAt(null);
            seat.setHoldExpiresAt(null);
        }

        showtimeSeatRepository.saveAll(seats);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setPaidAt(now);
        bookingRepository.save(booking);
        ticketIssuanceService.issueTickets(booking, now);
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(now);
    }

    private void validateBookingCanBePaid(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Booking is not awaiting payment");
        }
        if (booking.getExpiresAt() != null && !booking.getExpiresAt().isAfter(ZonedDateTime.now())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Booking has expired");
        }
    }

    private void validatePaymentAgainstBooking(java.math.BigDecimal amount, String currency, Booking booking) {
        if (amount == null || booking.getTotalAmount() == null || amount.compareTo(booking.getTotalAmount()) != 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Payment amount must match booking total amount");
        }
        if (currency == null || booking.getCurrency() == null || !booking.getCurrency().equalsIgnoreCase(currency)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Payment currency must match booking currency");
        }
    }
}
