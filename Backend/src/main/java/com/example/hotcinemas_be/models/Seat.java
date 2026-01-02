package com.example.hotcinemas_be.models;

import java.time.LocalDateTime;

import com.example.hotcinemas_be.enums.SeatStatus;
import com.example.hotcinemas_be.enums.SeatType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "seats", uniqueConstraints = {
        @UniqueConstraint(name = "unique_seat", columnNames = { "theater_id", "row", "col" })
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "theater_id", nullable = false)
    private Theater theater;

    @Column(name = "name", nullable = false, length = 10)
    private String name;

    @Column(name = "row", nullable = false)
    private Integer row;

    @Column(name = "col", nullable = false)
    private Integer col;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_type", length = 20)
    @Builder.Default
    private SeatType seatType = SeatType.REGULAR ;

    @Enumerated(EnumType.STRING)
    @Column(name = "seat_status", length = 20)
    @Builder.Default
    private SeatStatus seatStatus = SeatStatus.AVAILABLE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
