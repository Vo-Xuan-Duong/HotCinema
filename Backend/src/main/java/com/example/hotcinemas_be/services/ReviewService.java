package com.example.hotcinemas_be.services;

import com.example.hotcinemas_be.dtos.review.request.ReviewRequest;
import com.example.hotcinemas_be.dtos.review.response.ReviewResponse;
import com.example.hotcinemas_be.exceptions.AppException;
import com.example.hotcinemas_be.exceptions.ErrorCode;
import com.example.hotcinemas_be.mappers.CommentMapper;
import com.example.hotcinemas_be.models.Movie;
import com.example.hotcinemas_be.models.User;
import com.example.hotcinemas_be.repositorys.MovieRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

        private final CommentRepository commentRepository;
        private final MovieRepository movieRepository;
        private final AuthService authService;
        private final CommentMapper commentMapper;

        public ReviewResponse createComment(ReviewRequest reviewRequest) {

                User user = authService.getCurrentUser();
                Movie movie = movieRepository.findById(reviewRequest.getMovieId()).orElseThrow(
                                () -> new AppException("Movie not found",
                                                ErrorCode.MOVIE_NOT_FOUND));

                Comment parentComment = null;

                if (reviewRequest.getParentId() != null) {
                        parentComment = commentRepository.findById(reviewRequest.getParentId()).orElseThrow(
                                        () -> new AppException("Parent comment not found",
                                                        ErrorCode.MODEL_NOT_FOUND));
                }

                Comment comment = Comment.builder()
                                .movie(movie)
                                .user(user)
                                .comment(reviewRequest.getComment())
                                .rating(reviewRequest.getRating())
                                .parentComment(parentComment)
                                .build();

                Comment savedComment = commentRepository.save(comment);

                return commentMapper.mapToResponse(savedComment);
        }

        public void deleteComment(Long commentId) {
                Comment comment = commentRepository.findById(commentId).orElseThrow(
                                () -> new AppException("Comment not found",
                                                ErrorCode.MODEL_NOT_FOUND));
                commentRepository.delete(comment);
        }

        public ReviewResponse getCommentById(Long commentId) {
                Comment comment = commentRepository.findById(commentId).orElseThrow(
                                () -> new AppException("Comment not found",
                                                ErrorCode.MODEL_NOT_FOUND));
                return commentMapper.mapToResponse(comment);
        }

        public Page<ReviewResponse> getCommentsByMovieId(Long movieId, Pageable pageable) {
                Movie movie = movieRepository.findById(movieId).orElseThrow(
                                () -> new AppException("Movie not found",
                                                ErrorCode.MOVIE_NOT_FOUND));

                Page<Comment> commentsPage = commentRepository.findCommentsByMovieAndParentCommentIsNull(movie,
                                pageable);

                return commentsPage.map(commentMapper::mapToResponse);
        }

        public ReviewResponse updateComment(Long commentId, ReviewRequest reviewRequest) {
                Comment comment = commentRepository.findById(commentId).orElseThrow(
                                () -> new AppException("Comment not found",
                                                ErrorCode.MODEL_NOT_FOUND));
                comment.setComment(reviewRequest.getComment());
                comment.setRating(reviewRequest.getRating());
                Comment updatedComment = commentRepository.save(comment);
                return commentMapper.mapToResponse(updatedComment);
        }

        public Double getAverageRatingByMovieId(Long movieId) {
                Movie movie = movieRepository.findById(movieId).orElseThrow(
                                () -> new AppException("Movie not found",
                                                ErrorCode.MOVIE_NOT_FOUND));

                return commentRepository.findCommentsByMovieAndParentCommentIsNull(movie, Pageable.unpaged())
                                .stream()
                                .mapToInt(Comment::getRating)
                                .average()
                                .orElse(0.0);
        }

        public Long getCommentCountByMovieId(Long movieId) {
                Movie movie = movieRepository.findById(movieId).orElseThrow(
                                () -> new AppException("Movie not found",
                                                ErrorCode.MOVIE_NOT_FOUND));

                return commentRepository.findCommentsByMovieAndParentCommentIsNull(movie, Pageable.unpaged())
                                .getTotalElements();
        }
}
