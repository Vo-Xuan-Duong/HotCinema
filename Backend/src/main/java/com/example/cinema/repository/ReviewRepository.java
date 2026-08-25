package com.example.cinema.repository;

import com.example.cinema.entity.Review;
import com.example.cinema.entity.enums.ReviewStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {

    Optional<Review> findByIdAndIsActiveTrue(UUID id);

    Page<Review> findAllByParentIsNullAndIsActiveTrue(Pageable pageable);

    Page<Review> findAllByMovie_IdAndParentIsNullAndStatusAndIsActiveTrue(
            UUID movieId,
            ReviewStatus status,
            Pageable pageable
    );

    List<Review> findAllByParent_IdAndStatusAndIsActiveTrueOrderByCreatedAtAsc(
            UUID parentId,
            ReviewStatus status
    );

    List<Review> findAllByParent_IdAndIsActiveTrueOrderByCreatedAtAsc(UUID parentId);

    long countByMovie_IdAndParentIsNullAndStatusAndIsActiveTrue(UUID movieId, ReviewStatus status);

    @Query("""
            select avg(r.rating)
            from Review r
            where r.movie.id = :movieId
              and r.parent is null
              and r.status = :status
              and r.isActive = true
            """)
    Double findAverageRating(
            @Param("movieId") UUID movieId,
            @Param("status") ReviewStatus status
    );
}
