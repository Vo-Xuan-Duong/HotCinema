package com.example.hotcinemas_be.models;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.example.hotcinemas_be.enums.AudioType;
import com.example.hotcinemas_be.enums.Format;
import com.example.hotcinemas_be.enums.ShowtimeStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Enumerated(EnumType.STRING)
    @Column(name = "format", length = 20)
    private Format format;

    @Enumerated(EnumType.STRING)
    @Column(name = "audio_type", length = 20)
    private AudioType audioType;

    @Column(name = "show_date", nullable = false)
    private LocalDate showDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "base_price", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal basePrice = new BigDecimal("45000.00");

    @Column(name = "total_seat", nullable = false)
    private Integer totalSeat;

    @Column(name = "used_seat", nullable = false)
    private Integer usedSeat;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private ShowtimeStatus status = ShowtimeStatus.UPCOMING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "showtime", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Booking> bookings = new ArrayList<>();
}
