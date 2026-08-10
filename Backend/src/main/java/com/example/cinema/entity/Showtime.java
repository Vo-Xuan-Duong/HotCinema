package com.example.cinema.entity;

import com.example.cinema.entity.enums.ShowtimeFormat;
import com.example.cinema.entity.enums.ShowtimeStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.ZonedDateTime;

@Entity
@Table(name = "showtimes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Showtime extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auditorium_id", nullable = false)
    private Auditorium auditorium;

    @Column(name = "start_time", nullable = false)
    private ZonedDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private ZonedDateTime endTime;

    @Column(length = 100)
    private String language;

    @Column(length = 100)
    private String subtitle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShowtimeFormat format;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "booking_open_at")
    private ZonedDateTime bookingOpenAt;

    @Column(name = "booking_close_at")
    private ZonedDateTime bookingCloseAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ShowtimeStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;
}
