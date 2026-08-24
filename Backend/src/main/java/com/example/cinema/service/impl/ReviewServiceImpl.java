package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.review.ReviewCreateRequest;
import com.example.cinema.dto.review.ReviewRatingSummary;
import com.example.cinema.dto.review.ReviewResponse;
import com.example.cinema.dto.review.ReviewUpdateRequest;
import com.example.cinema.entity.Movie;
import com.example.cinema.entity.Review;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.ReviewStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.ReviewRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> findAll(Pageable pageable) {
        return PageMapper.toPageResponse(
                reviewRepository.findAllByParentIsNullAndIsActiveTrue(pageable)
                        .map(review -> toResponse(review, true))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReviewResponse> findByMovie(UUID movieId, Pageable pageable) {
        ensureMovieExists(movieId);
        return PageMapper.toPageResponse(
                reviewRepository.findAllByMovie_IdAndParentIsNullAndStatusAndIsActiveTrue(
                                movieId,
                                ReviewStatus.APPROVED,
                                pageable
                        )
                        .map(review -> toResponse(review, false))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse findById(UUID id) {
        return toResponse(findActive(id), true);
    }

    @Override
    @Transactional
    public ReviewResponse create(UUID userId, ReviewCreateRequest request) {
        Movie movie = findMovie(request.getMovieId());
        User user = findUser(userId);
        Review parent = resolveParent(request.getParentId(), movie.getId());

        Review review = Review.builder()
                .movie(movie)
                .user(user)
                .parent(parent)
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .status(ReviewStatus.APPROVED)
                .build();

        return toResponse(reviewRepository.save(review), true);
    }

    @Override
    @Transactional
    public ReviewResponse update(UUID id, UUID userId, ReviewUpdateRequest request) {
        Review review = findActive(id);
        if (!review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You can only edit your own review");
        }

        Movie movie = findMovie(request.getMovieId());
        Review parent = request.getParentId() != null
                ? resolveParent(request.getParentId(), movie.getId())
                : review.getParent();

        if (parent != null && !parent.getMovie().getId().equals(movie.getId())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Reply must belong to the same movie as its parent review");
        }

        review.setMovie(movie);
        review.setParent(parent);
        review.setRating(request.getRating());
        review.setComment(request.getComment().trim());
        if (review.getStatus() == ReviewStatus.REJECTED) {
            review.setStatus(ReviewStatus.PENDING);
        }

        return toResponse(reviewRepository.save(review), true);
    }

    @Override
    @Transactional
    public void delete(UUID id, UUID userId, boolean moderator) {
        Review review = findActive(id);
        if (!moderator && !review.getUser().getId().equals(userId)) {
            throw new AppException(ErrorCode.FORBIDDEN, "You can only delete your own review");
        }

        review.setActive(false);
        reviewRepository.save(review);

        if (review.getParent() == null) {
            List<Review> replies = reviewRepository.findAllByParent_IdAndIsActiveTrueOrderByCreatedAtAsc(review.getId());
            replies.forEach(reply -> reply.setActive(false));
            reviewRepository.saveAll(replies);
        }
    }

    @Override
    @Transactional
    public ReviewResponse moderate(UUID id, ReviewStatus status) {
        if (status != ReviewStatus.APPROVED && status != ReviewStatus.REJECTED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Unsupported review moderation status");
        }
        Review review = findActive(id);
        review.setStatus(status);
        return toResponse(reviewRepository.save(review), true);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewRatingSummary getRatingSummary(UUID movieId) {
        ensureMovieExists(movieId);
        Double average = reviewRepository.findAverageRating(movieId, ReviewStatus.APPROVED);
        long count = reviewRepository.countByMovie_IdAndParentIsNullAndStatusAndIsActiveTrue(
                movieId,
                ReviewStatus.APPROVED
        );
        return new ReviewRatingSummary(average == null ? 0.0 : average, count);
    }

    private Review findActive(UUID id) {
        return reviewRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", id.toString()));
    }

    private Movie findMovie(UUID movieId) {
        return movieRepository.findByIdAndIsActiveTrue(movieId)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", movieId.toString()));
    }

    private User findUser(UUID userId) {
        return userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
    }

    private void ensureMovieExists(UUID movieId) {
        findMovie(movieId);
    }

    private Review resolveParent(UUID parentId, UUID movieId) {
        if (parentId == null) return null;
        Review parent = findActive(parentId);
        if (parent.getParent() != null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Nested replies are not supported");
        }
        if (!parent.getMovie().getId().equals(movieId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Reply must belong to the same movie as its parent review");
        }
        return parent;
    }

    private ReviewResponse toResponse(Review review, boolean includeUnapprovedReplies) {
        List<ReviewResponse> replies = new ArrayList<>();
        if (review.getParent() == null) {
            List<Review> childReviews = includeUnapprovedReplies
                    ? reviewRepository.findAllByParent_IdAndIsActiveTrueOrderByCreatedAtAsc(review.getId())
                    : reviewRepository.findAllByParent_IdAndStatusAndIsActiveTrueOrderByCreatedAtAsc(
                            review.getId(),
                            ReviewStatus.APPROVED
                    );
            replies = childReviews.stream().map(this::toFlatResponse).toList();
        }

        ReviewResponse response = toFlatResponse(review);
        response.setReplies(replies);
        return response;
    }

    private ReviewResponse toFlatResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .movieId(review.getMovie().getId())
                .movieTitle(review.getMovie().getTitle())
                .userId(review.getUser().getId())
                .fullName(review.getUser().getFullName())
                .avatarUrl(review.getUser().getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .parentId(review.getParent() == null ? null : review.getParent().getId())
                .replies(new ArrayList<>())
                .build();
    }
}
