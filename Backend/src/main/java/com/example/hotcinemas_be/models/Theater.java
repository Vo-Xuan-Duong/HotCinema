package com.example.hotcinemas_be.models;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.hotcinemas_be.enums.ScreenType;
import com.example.hotcinemas_be.enums.SoundSystem;
import com.example.hotcinemas_be.enums.TheaterType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "theaters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Theater {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cinema_id", nullable = false)
    private Cinema cinema;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "theater_type", length = 20)
    @Builder.Default
    private TheaterType theaterType = TheaterType.TWO_D;

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats;

    @Enumerated(EnumType.STRING)
    @Column(name = "screen_type", length = 50)
    @Builder.Default
    private ScreenType screenType = ScreenType.STANDARD;

    @Enumerated(EnumType.STRING)
    @Column(name = "sound_system", length = 50)
    @Builder.Default
    private SoundSystem soundSystem = SoundSystem.STEREO;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Seat> seats = new ArrayList<>();

    @OneToMany(mappedBy = "theater", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Showtime> showtimes = new ArrayList<>();
}



