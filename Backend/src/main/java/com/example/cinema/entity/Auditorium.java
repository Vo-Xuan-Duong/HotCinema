package com.example.cinema.entity;

import com.example.cinema.entity.enums.AuditoriumStatus;
import com.example.cinema.entity.enums.ScreenType;
import jakarta.persistence.*;
import lombok.*;
import java.time.ZonedDateTime;

@Entity
@Table(name = "auditoriums")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Auditorium extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(nullable = false, length = 50)
    private String code;

    @Column(nullable = false, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "screen_type", nullable = false, length = 30)
    private ScreenType screenType;

    @Column(name = "total_rows")
    private Integer totalRows;

    @Column(name = "total_columns")
    private Integer totalColumns;

    @Column(nullable = false)
    private Integer capacity = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AuditoriumStatus status;

    @Column(name = "deleted_at")
    private ZonedDateTime deletedAt;
}
