package com.example.hotcinemas_be.specifications;

import com.example.hotcinemas_be.dtos.movie.requests.MovieSearchRequest;
import com.example.hotcinemas_be.models.Genre;
import com.example.hotcinemas_be.models.Movie;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
public class MovieSpecification {

    public Specification<Movie> build(MovieSearchRequest request) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
                String pattern = "%" + request.getKeyword().trim().toLowerCase() + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("originalTitle")), pattern)
                ));
            }

            if (request.getGenre() != null && !request.getGenre().isEmpty()) {
                Join<Movie, Genre> genreJoin = root.join("genres", JoinType.INNER);
                predicates.add(genreJoin.get("id").in(request.getGenre()));

                Objects.requireNonNull(query).distinct(true);
            }

            if (request.getStatus() != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), request.getStatus()));
            }

            if (request.getReleaseYear() != null) {
                int year = request.getReleaseYear();
                LocalDate startOfYear = LocalDate.of(year, 1, 1);
                LocalDate endOfYear = LocalDate.of(year, 12, 31);

                predicates.add(criteriaBuilder.between(root.get("releaseDate"), startOfYear, endOfYear));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}