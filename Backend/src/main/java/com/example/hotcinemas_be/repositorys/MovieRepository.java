package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.dtos.movie.requests.MovieSearchRequest;
import com.example.hotcinemas_be.enums.MovieStatus;
import com.example.hotcinemas_be.models.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieRepository extends JpaRepository<Movie, Long>, JpaSpecificationExecutor<Movie> {
        Page<Movie> findMovieByStatus(MovieStatus status, Pageable pageable);

    @Query("SELECT m, AVG(r.rating) as avgRating, COUNT(r) as reviewCount " +
            "FROM Movie m " +
            "LEFT JOIN m.reviews r " +
            "GROUP BY m " +
            "HAVING COUNT(r) > 0 " +
            "ORDER BY avgRating DESC, reviewCount DESC")
    Page<Movie> findTopRatedMovies(Pageable pageable);

    Optional<Movie> findByTitle(String title);

    boolean existsByTitle(String title);
}
