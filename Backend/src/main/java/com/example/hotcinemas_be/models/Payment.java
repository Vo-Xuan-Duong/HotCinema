package com.example.hotcinemas_be.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.hotcinemas_be.enums.PaymentMethod;
import com.example.hotcinemas_be.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "payment_method", nullable = false, length = 50)
    private PaymentMethod paymentMethod;

    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "transaction_id", length = 255)
    private String transactionId;

    @Column(name = "payment_details", columnDefinition = "TEXT")
    private String paymentDetails;

    @Column(name = "payment_date")
    private LocalDateTime paymentDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
