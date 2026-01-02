package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.MovieGenre;
import com.example.hotcinemas_be.models.MovieGenreId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MovieGenreRepository extends JpaRepository<MovieGenre, MovieGenreId> {
    List<MovieGenre> findMovieGenresByMovie_Id(Long movieId);
}
