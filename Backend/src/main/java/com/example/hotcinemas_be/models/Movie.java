package com.example.hotcinemas_be.models;

import com.example.hotcinemas_be.enums.MovieStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Entity
@Table(name = "movies")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "original_title", length = 255)
    private String originalTitle;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Positive
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "release_date", nullable = false)
    private LocalDate releaseDate;

    @Column(name = "language", length = 50)
    @Builder.Default
    private String language = "Tiếng Việt";

    @Column(name = "subtitle", length = 50)
    private String subtitle;

    @Column(name = "rating", length = 10)
    @Builder.Default
    private String rating = "P";

    @Column(name = "poster_url", length = 500)
    private String posterUrl;

    @Column(name = "backdrop_url", length = 500)
    private String backdropUrl;

    @Column(name = "trailer_url", length = 500)
    private String trailerUrl;

    @Column(name = "director", length = 255)
    private String director;

    @Column(name = "actors")
    private List<String> actors;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private MovieStatus status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<MovieGenre> movieGenres = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Review> reviews = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<Showtime> showtimes = new ArrayList<>();

    public String durationFormatted(Integer durationMinutes) {
        Duration d = Duration.ofMinutes(durationMinutes);
        long hours = d.toHours();
        long minutes = d.toMinutesPart(); // Java 9+

        return String.format("%dh %02dm", hours, minutes); // Định dạng ngắn gọn: 2h 05m
    }
}
