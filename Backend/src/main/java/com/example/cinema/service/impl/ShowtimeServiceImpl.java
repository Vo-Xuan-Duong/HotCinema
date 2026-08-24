package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtime.ShowtimeCreateRequest;
import com.example.cinema.dto.showtime.ShowtimeResponse;
import com.example.cinema.dto.showtime.ShowtimeUpdateRequest;
import com.example.cinema.entity.Showtime;
import com.example.cinema.entity.enums.ShowtimeStatus;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.ShowtimeMapper;
import com.example.cinema.repository.AuditoriumRepository;
import com.example.cinema.repository.MovieRepository;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository repository;
    private final ShowtimeMapper showtimeMapper;
    private final MovieRepository movieRepository;
    private final AuditoriumRepository auditoriumRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> findAll() {
        return showtimeMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShowtimeResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(showtimeMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> search(
            UUID movieId,
            UUID cinemaId,
            UUID auditoriumId,
            LocalDate date,
            LocalDate fromDate,
            LocalDate toDate,
            ShowtimeStatus status
    ) {
        Specification<Showtime> specification = (root, query, criteriaBuilder) ->
                criteriaBuilder.isTrue(root.get("isActive"));

        if (movieId != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("movie").get("id"), movieId));
        }

        if (cinemaId != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("auditorium").get("cinema").get("id"), cinemaId));
        }

        if (auditoriumId != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("auditorium").get("id"), auditoriumId));
        }

        if (status != null) {
            specification = specification.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }

        if (date != null) {
            ZonedDateTime start = startOfDay(date);
            ZonedDateTime end = startOfDay(date.plusDays(1));
            specification = specification.and((root, query, criteriaBuilder) -> criteriaBuilder.and(
                    criteriaBuilder.greaterThanOrEqualTo(root.<ZonedDateTime>get("startTime"), start),
                    criteriaBuilder.lessThan(root.<ZonedDateTime>get("startTime"), end)
            ));
        } else {
            if (fromDate != null) {
                ZonedDateTime start = startOfDay(fromDate);
                specification = specification.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.greaterThanOrEqualTo(root.<ZonedDateTime>get("startTime"), start));
            }
            if (toDate != null) {
                ZonedDateTime end = startOfDay(toDate.plusDays(1));
                specification = specification.and((root, query, criteriaBuilder) ->
                        criteriaBuilder.lessThan(root.<ZonedDateTime>get("startTime"), end));
            }
        }

        return showtimeMapper.toResponseList(repository.findAll(specification, Sort.by(Sort.Direction.ASC, "startTime")));
    }

    private ZonedDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay(ZoneId.systemDefault());
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimes", key = "#id")
    public ShowtimeResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(showtimeMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", allEntries = true)
    public ShowtimeResponse create(ShowtimeCreateRequest request) {
        Showtime entity = showtimeMapper.toEntity(request);
        applyRelations(entity, request.getMovieId(), request.getAuditoriumId(), request.getCreatedById());
        return showtimeMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", allEntries = true)
    public ShowtimeResponse update(UUID id, ShowtimeUpdateRequest request) {
        Showtime entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", id.toString()));
        showtimeMapper.updateEntityFromRequest(request, entity);
        applyRelations(entity, request.getMovieId(), request.getAuditoriumId(), request.getCreatedById());
        return showtimeMapper.toResponse(repository.save(entity));
    }

    private void applyRelations(Showtime entity, UUID movieId, UUID auditoriumId, UUID createdById) {
        if (movieId != null) {
            entity.setMovie(movieRepository.findByIdAndIsActiveTrue(movieId)
                    .orElseThrow(() -> new ResourceNotFoundException("Movie", movieId.toString())));
        }
        if (auditoriumId != null) {
            entity.setAuditorium(auditoriumRepository.findByIdAndIsActiveTrue(auditoriumId)
                    .orElseThrow(() -> new ResourceNotFoundException("Auditorium", auditoriumId.toString())));
        }
        if (createdById != null) {
            entity.setCreatedBy(userRepository.findByIdAndIsActiveTrue(createdById)
                    .orElseThrow(() -> new ResourceNotFoundException("User", createdById.toString())));
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimes", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }
}
