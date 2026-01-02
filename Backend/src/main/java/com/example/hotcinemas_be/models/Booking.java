package com.example.hotcinemas_be.models;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.hotcinemas_be.dtos.seat.SeatSnapshot;
import com.example.hotcinemas_be.enums.BookingStatus;
import io.lettuce.core.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "bookings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "showtime_id", nullable = false)
    private Showtime showtime;

    @Column(name = "booking_code", unique = true, nullable = false, length = 20)
    private String bookingCode;

    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "seat_snapshots", columnDefinition = "json")
    private List<SeatSnapshot> seatSnapshots;

    @Column(name = "booking_date", nullable = false)
    @Builder.Default
    private LocalDateTime bookingDate = LocalDateTime.now();

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingSeat> bookingSeats = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BookingCombo> bookingCombos = new ArrayList<>();
}
