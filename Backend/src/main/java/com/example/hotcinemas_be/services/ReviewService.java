package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.review.request.ReviewRequest;
import com.example.hotcinemas_be.dtos.review.response.ReviewResponse;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.mappers.ReviewMapper;
import com.example.hotcinemas_be.models.Movie;
import com.example.hotcinemas_be.models.Review;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.MovieRepository;
import com.example.hotcinemas_be.repositorys.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

        private final ReviewRepository reviewRepository;
        private final MovieRepository movieRepository;
        private final AuthService authService;
        private final ReviewMapper reviewMapper;

        public ReviewResponse createReview(ReviewRequest reviewRequest) {
                User user = authService.getCurrentUser();
                Movie movie = movieRepository.findById(reviewRequest.getMovieId()).orElseThrow(
                                () -> new AppException("Movie not found",
                                                ErrorCode.MOVIE_NOT_FOUND));

                Review parentReview = null;

                if (reviewRequest.getParentId() != null) {
                        parentReview = reviewRepository.findById(reviewRequest.getParentId()).orElseThrow(
                                        () -> new AppException("Parent review not found",
                                                        ErrorCode.MODEL_NOT_FOUND));
                }

                Review review = Review.builder()
                                .movie(movie)
                                .user(user)
                                .comment(reviewRequest.getComment())
                                .rating(reviewRequest.getRating() != null ? reviewRequest.getRating() : 0)
                                .parentReview(parentReview)
                                .build();

                Review savedReview = reviewRepository.save(review);

                return reviewMapper.mapToResponse(savedReview);
        }

        public void deleteReview(Long reviewId) {
                Review review = reviewRepository.findById(reviewId).orElseThrow(
                                () -> new AppException("Review not found",
                                                ErrorCode.MODEL_NOT_FOUND));
                reviewRepository.delete(review);
        }

        public ReviewResponse getReviewById(Long reviewId) {
                Review review = reviewRepository.findById(reviewId).orElseThrow(
                                () -> new AppException("Review not found",
                                                ErrorCode.MODEL_NOT_FOUND));
                return reviewMapper.mapToResponse(review);
        }

        public Page<ReviewResponse> getReviewsByMovieId(Long movieId, Pageable pageable) {
                Page<Review> reviewPage = reviewRepository.findReviewsByMovie_IdAndParentReviewIsNull(movieId, pageable);

                return reviewPage.map(reviewMapper::mapToResponse);
        }

        public ReviewResponse updateReview(Long reviewId, ReviewRequest reviewRequest) {
                Review review = reviewRepository.findById(reviewId).orElseThrow(
                                () -> new AppException("Review not found",
                                                ErrorCode.MODEL_NOT_FOUND));
                review.setComment(reviewRequest.getComment());
                review.setRating(reviewRequest.getRating());
                Review updatedReview = reviewRepository.save(review);
                return reviewMapper.mapToResponse(updatedReview);
        }

        public Double getAverageRatingByMovieId(Long movieId) {
                List<Review> reviews = reviewRepository.findReviewsByMovie_Id(movieId);

                return reviews.stream()
                                .mapToInt(Review::getRating)
                                .average()
                                .orElse(0.0);
        }

        public Integer getTotalReviewByMovieId(Long movieId) {
                return (Integer) reviewRepository.findReviewsByMovie_IdAndParentReviewIsNull(movieId).size();

        }

        public Object getAllReviews(Pageable pageable) {
                Page<Review> reviewPage = reviewRepository.findAll(pageable);
                return reviewPage.map(reviewMapper::mapToItemResponse);
        }
}
