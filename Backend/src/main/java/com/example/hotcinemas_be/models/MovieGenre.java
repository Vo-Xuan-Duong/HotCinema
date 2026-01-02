package com.example.hotcinemas_be.models;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "movie_genres")
@IdClass(MovieGenreId.class)
public class MovieGenre {
    @Id
    @ManyToOne
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    @Id
    @ManyToOne
    @JoinColumn(name = "genre_id", nullable = false)
    private Genre genre;
}
