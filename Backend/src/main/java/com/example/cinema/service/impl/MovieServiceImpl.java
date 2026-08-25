package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.movie.MovieCreateRequest;
import com.example.cinema.dto.movie.MovieResponse;
import com.example.cinema.dto.movie.MovieUpdateRequest;
import com.example.cinema.entity.Genre;
import com.example.cinema.entity.Movie;
import com.example.cinema.entity.enums.MovieStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.MovieMapper;
import com.example.cinema.repository.GenreRepository;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.service.MovieService;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository repository;
    private final MovieMapper movieMapper;
    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> findAll() {
        return movieMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(movieMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<MovieResponse> search(
            String keyword,
            String genre,
            MovieStatus status,
            Integer releaseYear,
            Pageable pageable
    ) {
        Specification<Movie> specification = (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isActive"));

        if (keyword != null && !keyword.isBlank()) {
            String pattern = "%" + keyword.trim().toLowerCase(Locale.ROOT) + "%";
            specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("title")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("originalTitle")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("director")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("actors")), pattern)
            ));
        }

        if (status != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }

        if (releaseYear != null) {
            LocalDate firstDay = LocalDate.of(releaseYear, 1, 1);
            LocalDate lastDay = LocalDate.of(releaseYear, 12, 31);
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.between(root.<LocalDate>get("releaseDate"), firstDay, lastDay));
        }

        if (genre != null && !genre.isBlank()) {
            String genreFilter = genre.trim();
            UUID genreId = parseUuid(genreFilter);
            specification = specification.and((root, query, criteriaBuilder) -> {
                Join<Movie, Genre> genreJoin = root.join("genres", JoinType.INNER);
                query.distinct(true);
                if (genreId != null) {
                    return criteriaBuilder.equal(genreJoin.get("id"), genreId);
                }
                String normalized = genreFilter.toLowerCase(Locale.ROOT);
                return criteriaBuilder.or(
                        criteriaBuilder.equal(criteriaBuilder.lower(genreJoin.<String>get("name")), normalized),
                        criteriaBuilder.equal(criteriaBuilder.lower(genreJoin.<String>get("slug")), normalized)
                );
            });
        }

        return PageMapper.toPageResponse(repository.findAll(specification, pageable).map(movieMapper::toResponse));
    }

    private UUID parseUuid(String value) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException ignored) {
            return null;
        }
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "movies", key = "#id")
    public MovieResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(movieMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", allEntries = true)
    public MovieResponse create(MovieCreateRequest request) {
        Movie entity = movieMapper.toEntity(request);
        entity.setGenres(resolveGenres(request.getGenres()));
        return movieMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", allEntries = true)
    public MovieResponse update(UUID id, MovieUpdateRequest request) {
        Movie entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        movieMapper.updateEntityFromRequest(request, entity);
        entity.setGenres(resolveGenres(request.getGenres()));
        return movieMapper.toResponse(repository.save(entity));
    }

    private java.util.Set<Genre> resolveGenres(java.util.Set<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return new java.util.HashSet<>();
        }
        var genres = genreRepository.findAllByIdIn(ids);
        if (genres.size() != ids.size()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "One or more genre IDs do not exist");
        }
        return genres;
    }

    @Override
    @Transactional
    @CacheEvict(value = "movies", key = "#id")
    public void deleteById(UUID id) {
        Movie entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movie", id.toString()));
        entity.setActive(false);
        entity.setDeletedAt(ZonedDateTime.now());
        repository.save(entity);
    }
}
