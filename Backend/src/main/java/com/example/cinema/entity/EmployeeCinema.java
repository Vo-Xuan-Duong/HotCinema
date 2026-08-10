package com.example.cinema.entity;

import com.example.cinema.entity.enums.EmployeePosition;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "employee_cinemas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeCinema {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EmployeePosition position;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "assigned_at", nullable = false)
    private ZonedDateTime assignedAt;

    @Column(name = "ended_at")
    private ZonedDateTime endedAt;
}
