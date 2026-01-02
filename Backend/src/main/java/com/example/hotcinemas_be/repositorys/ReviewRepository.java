package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findReviewsByMovie_IdAndParentReviewIsNull(Long movieId, Pageable pageable);
    List<Review> findReviewsByMovie_Id(Long movieId);
    List<Review> findReviewsByMovie_IdAndParentReviewIsNull(Long movieId);
}
