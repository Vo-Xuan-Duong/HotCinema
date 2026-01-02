package com.example.hotcinemas_be.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "genres")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Genre {

    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "name", unique = true, nullable = false, length = 100)
    private String name;

    @OneToMany(mappedBy = "genre", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MovieGenre> movieGenres = new ArrayList<>();
}
