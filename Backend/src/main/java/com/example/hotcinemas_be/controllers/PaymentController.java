package com.example.hotcinemas_be.controllers;

import com.example.hotcinemas_be.dtos.common.DataResponse;
import com.example.hotcinemas_be.dtos.momo.MomoIpnRequest;
import com.example.hotcinemas_be.dtos.payment.requests.PaymentRequest;
import com.example.hotcinemas_be.dtos.payment.responses.PaymentResponse;
import com.example.hotcinemas_be.enums.PaymentStatus;
import com.example.hotcinemas_be.services.PaymentService;
import com.example.hotcinemas_be.services.MomoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Payment Management", description = "APIs for managing payments")
public class PaymentController {

        private final PaymentService paymentService;
        private final MomoService momoService;

        @Operation(summary = "Create a new payment", description = "This endpoint allows creating a new payment for a booking.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "201", description = "Payment created successfully"),
                        @ApiResponse(responseCode = "400", description = "Invalid input data"),
                        @ApiResponse(responseCode = "404", description = "Booking not found")
        })
        @PostMapping
        public ResponseEntity<DataResponse<PaymentResponse>> createPayment(
                        @Valid @RequestBody PaymentRequest paymentRequest) {
                log.info("Creating new payment for booking ID: {}", paymentRequest.getBookingId());
                PaymentResponse paymentResponse = paymentService.createPayment(paymentRequest);

                DataResponse<PaymentResponse> dataResponse = DataResponse.<PaymentResponse>builder()
                                .status(HttpStatus.CREATED.value())
                                .message("Payment has been successfully created")
                                .data(paymentResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.status(HttpStatus.CREATED).body(dataResponse);
        }

        @Operation(summary = "Get all payments", description = "This endpoint retrieves all payments with pagination.")
        @GetMapping
        @PreAuthorize("hasAuthority('PAYMENT_LIST')")
        public ResponseEntity<DataResponse<?>> getAllPayments(
                        @Parameter(description = "Pagination parameters") Pageable pageable) {
                log.info("Retrieving all payments with pagination");

                DataResponse<?> dataResponse = DataResponse.builder()
                                .status(HttpStatus.OK.value())
                                .message("Payments retrieved successfully")
                                .data(paymentService.getAllPayments(pageable))
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get a payment by ID", description = "This endpoint retrieves a payment by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Payment found"),
                        @ApiResponse(responseCode = "404", description = "Payment not found")
        })
        @GetMapping("/{id}")
        @PreAuthorize("hasAuthority('PAYMENT_READ')")
        public ResponseEntity<DataResponse<PaymentResponse>> getPaymentById(
                        @Parameter(description = "Payment ID") @PathVariable Long id) {
                log.info("Retrieving payment with ID: {}", id);
                PaymentResponse payment = paymentService.getPaymentById(id);

                DataResponse<PaymentResponse> dataResponse = DataResponse.<PaymentResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Payment retrieved successfully")
                                .data(payment)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get payments by booking ID", description = "This endpoint retrieves all payments for a specific booking.")
        @GetMapping("/booking/{bookingId}")
        public ResponseEntity<DataResponse<List<PaymentResponse>>> getPaymentsByBookingId(
                        @Parameter(description = "Booking ID") @PathVariable Long bookingId) {
                log.info("Retrieving payments for booking ID: {}", bookingId);
                List<PaymentResponse> payments = paymentService.getPaymentsByBookingId(bookingId);

                DataResponse<List<PaymentResponse>> dataResponse = DataResponse.<List<PaymentResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Payments for booking retrieved successfully")
                                .data(payments)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Get payments by status", description = "This endpoint retrieves all payments with a specific status.")
        @GetMapping("/status/{status}")
        public ResponseEntity<DataResponse<List<PaymentResponse>>> getPaymentsByStatus(
                        @Parameter(description = "Payment status") @PathVariable PaymentStatus status) {
                log.info("Retrieving payments with status: {}", status);
                List<PaymentResponse> payments = paymentService.getPaymentsByStatus(status);

                DataResponse<List<PaymentResponse>> dataResponse = DataResponse.<List<PaymentResponse>>builder()
                                .status(HttpStatus.OK.value())
                                .message("Payments with status retrieved successfully")
                                .data(payments)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update payment status", description = "This endpoint allows updating the status of a payment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Payment status updated successfully"),
                        @ApiResponse(responseCode = "404", description = "Payment not found")
        })
        @PatchMapping("/{id}/status")
        public ResponseEntity<DataResponse<PaymentResponse>> updatePaymentStatus(
                        @Parameter(description = "Payment ID") @PathVariable Long id,
                        @RequestBody PaymentStatus status) {
                log.info("Updating payment status for ID {} to {}", id, status);
                PaymentResponse paymentResponse = paymentService.updatePaymentStatus(id, status);

                DataResponse<PaymentResponse> dataResponse = DataResponse.<PaymentResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Payment status has been successfully updated")
                                .data(paymentResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Update transaction ID", description = "This endpoint allows updating the transaction ID of a payment.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Transaction ID updated successfully"),
                        @ApiResponse(responseCode = "404", description = "Payment not found")
        })
        @PatchMapping("/{id}/transaction-id")
        public ResponseEntity<DataResponse<PaymentResponse>> updateTransactionId(
                        @Parameter(description = "Payment ID") @PathVariable Long id,
                        @RequestBody String transactionId) {
                log.info("Updating transaction ID for payment ID {} to {}", id, transactionId);
                PaymentResponse paymentResponse = paymentService.updateTransactionId(id, transactionId);

                DataResponse<PaymentResponse> dataResponse = DataResponse.<PaymentResponse>builder()
                                .status(HttpStatus.OK.value())
                                .message("Transaction ID has been successfully updated")
                                .data(paymentResponse)
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "Delete a payment", description = "This endpoint allows deleting a payment by its ID.")
        @ApiResponses(value = {
                        @ApiResponse(responseCode = "200", description = "Payment deleted successfully"),
                        @ApiResponse(responseCode = "404", description = "Payment not found")
        })
        @DeleteMapping("/{id}")
        public ResponseEntity<DataResponse<Void>> deletePayment(
                        @Parameter(description = "Payment ID") @PathVariable Long id) {
                log.info("Deleting payment with ID: {}", id);
                paymentService.deletePayment(id);

                DataResponse<Void> dataResponse = DataResponse.<Void>builder()
                                .status(HttpStatus.OK.value())
                                .message("Payment has been successfully deleted")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(dataResponse);
        }

        @Operation(summary = "MoMo IPN callback", description = "Handle MoMo IPN to update payment status")
        @PostMapping("/momo-callback")
        public ResponseEntity<DataResponse<String>> momoCallBack(@RequestBody MomoIpnRequest ipn) {
                boolean ok = momoService.verifyIpn(ipn);

                if (!ok) {
                        DataResponse<String> res = DataResponse.<String>builder()
                                        .status(HttpStatus.BAD_REQUEST.value())
                                        .message("Invalid signature")
                                        .timestamp(LocalDateTime.now())
                                        .build();
                        return ResponseEntity.badRequest().body(res);
                }

                PaymentStatus status = ipn.getResultCode() == 0 ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;
                paymentService.updateStatusByBookingCode(ipn.getOrderId(), status, ipn.getTransId());

                DataResponse<String> res = DataResponse.<String>builder()
                                .status(HttpStatus.OK.value())
                                .message("OK")
                                .timestamp(LocalDateTime.now())
                                .build();
                return ResponseEntity.ok(res);
        }

}
