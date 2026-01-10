package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.momo.MomoResponse;
import com.example.hotcinemas_be.dtos.payment.requests.PaymentRequest;
import com.example.hotcinemas_be.dtos.payment.responses.PaymentResponse;
import com.example.hotcinemas_be.enums.BookingStatus;
import com.example.hotcinemas_be.enums.PaymentMethod;
import com.example.hotcinemas_be.enums.PaymentStatus;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.mappers.PaymentMapper;
import com.example.hotcinemas_be.models.Booking;
import com.example.hotcinemas_be.models.Payment;
import com.example.hotcinemas_be.repositorys.BookingRepository;
import com.example.hotcinemas_be.repositorys.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMapper paymentMapper;
    private final BookingRepository bookingRepository;
    private final MomoService momoService;
    private final BookingSeatService bookingSeatService;

    public PaymentResponse createPayment(PaymentRequest paymentRequest) {
        Booking booking = bookingRepository.findById(paymentRequest.getBookingId())
                .orElseThrow(() -> new AppException("Booking not found with id: " + paymentRequest.getBookingId(),
                        ErrorCode.BOOKING_NOT_FOUND));

        Payment payment = Payment.builder()
                .booking(booking)
                .amount(booking.getTotalAmount())
                .paymentMethod(paymentRequest.getPaymentMethod())
                .paymentStatus(PaymentStatus.PENDING)
                .paymentDetails(paymentRequest.getPaymentDetails())
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        PaymentResponse response = paymentMapper.mapToResponse(savedPayment);

        if (paymentRequest.getPaymentMethod() == PaymentMethod.MOMO) {
            long amount = booking.getTotalAmount().longValue();
            String orderId = booking.getBookingCode();
            String orderInfo = "Payment for booking " + booking.getBookingCode();

            MomoResponse momoResponse = momoService.createMethodMomo(orderId, amount, orderInfo);
            log.info("Momo Response: {}", momoResponse);

            response.setPaymentUrl(momoResponse.getPayUrl());
        } else if (paymentRequest.getPaymentMethod() == PaymentMethod.VNPAY) {
            // Implement VNPAY payment method handling here

        } else {
            // Handle other payment methods if necessary
        }
        return response;
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException("Payment not found with id: " + paymentId,
                        ErrorCode.MODEL_NOT_FOUND));
        return paymentMapper.mapToResponse(payment);
    }

    public void deletePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException("Payment not found with id: " + paymentId,
                        ErrorCode.MODEL_NOT_FOUND));
        paymentRepository.delete(payment);
    }

    @Transactional(readOnly = true)
    public Page<PaymentResponse> getAllPayments(Pageable pageable) {
        Page<Payment> payments = paymentRepository.findAll(pageable);
        return payments.map(paymentMapper::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        List<Payment> payments = paymentRepository.findAll();
        return payments.stream().map(paymentMapper::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByBookingId(Long bookingId) {
        List<Payment> payments = paymentRepository.findByBookingId(bookingId);
        return payments.stream().map(paymentMapper::mapToResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByStatus(PaymentStatus status) {
        List<Payment> payments = paymentRepository.findByPaymentStatus(status);
        return payments.stream().map(paymentMapper::mapToResponse).toList();
    }

    public PaymentResponse updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException("Payment not found with id: " + paymentId,
                        ErrorCode.MODEL_NOT_FOUND));

        payment.setPaymentStatus(status);
        Payment updatedPayment = paymentRepository.save(payment);
        return paymentMapper.mapToResponse(updatedPayment);
    }

    public PaymentResponse updateTransactionId(Long paymentId, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new AppException("Payment not found with id: " + paymentId,
                        ErrorCode.MODEL_NOT_FOUND));

        payment.setTransactionId(transactionId);
        Payment updatedPayment = paymentRepository.save(payment);
        return paymentMapper.mapToResponse(updatedPayment);
    }

    public void updateStatusByBookingCode(String bookingCode, PaymentStatus status, String transactionId) {
        Payment payment = paymentRepository.findPaymentByBooking_BookingCode(bookingCode)
                .orElseThrow(() -> new AppException("Payment not found for booking id: " + bookingCode,
                        ErrorCode.MODEL_NOT_FOUND));

        payment.setPaymentStatus(status);
        payment.setTransactionId(transactionId);

        paymentRepository.save(payment);

        Booking booking = payment.getBooking();

        if (status == PaymentStatus.SUCCESS) {
            if (booking.getStatus() != BookingStatus.CONFIRMED) {
                bookingSeatService.createBookingSeats(booking.getId());
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);
            }
        } else if (status == PaymentStatus.FAILED) {
            booking.setStatus(BookingStatus.PENDING);
            bookingRepository.save(booking);

        }
    }
}
