package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import com.example.cinema.entity.Seat;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.ShowtimeSeatMapper;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.ShowtimeSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeSeatServiceImpl implements ShowtimeSeatService {

    private final ShowtimeSeatRepository repository;
    private final ShowtimeSeatMapper showtimeSeatMapper;
    private final UserRepository userRepository;

    @Value("${app.booking.seat-hold-seconds:300}")
    private long seatHoldSeconds;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeSeatResponse> findAll() {
        return repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<ShowtimeSeatResponse> findByShowtime(UUID showtimeId) {
        repository.releaseExpiredHolds(
                showtimeId,
                ShowtimeSeatStatus.HELD,
                ShowtimeSeatStatus.AVAILABLE,
                ZonedDateTime.now()
        );
        return repository.findAllByShowtime_IdAndIsActiveTrue(showtimeId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ShowtimeSeatResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "showtimeseats", key = "#id")
    public ShowtimeSeatResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", allEntries = true)
    public ShowtimeSeatResponse holdSeat(UUID showtimeId, UUID seatId, UUID userId) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        ShowtimeSeat entity = repository.findForUpdate(showtimeId, seatId)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", seatId.toString()));

        ZonedDateTime now = ZonedDateTime.now();
        releaseIfExpired(entity, now);

        if (entity.getStatus() == ShowtimeSeatStatus.HELD) {
            if (entity.getHeldByUser() != null && userId.equals(entity.getHeldByUser().getId())) {
                return toResponse(entity);
            }
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Seat is already held by another user");
        }

        if (entity.getStatus() != ShowtimeSeatStatus.AVAILABLE) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Seat is not available");
        }

        entity.setStatus(ShowtimeSeatStatus.HELD);
        entity.setHeldByUser(user);
        entity.setHoldToken(UUID.randomUUID());
        entity.setHeldAt(now);
        entity.setHoldExpiresAt(now.plusSeconds(seatHoldSeconds));

        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", allEntries = true)
    public ShowtimeSeatResponse releaseSeat(UUID showtimeId, UUID seatId, UUID userId) {
        ShowtimeSeat entity = repository.findForUpdate(showtimeId, seatId)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", seatId.toString()));

        ZonedDateTime now = ZonedDateTime.now();
        if (releaseIfExpired(entity, now)) {
            return toResponse(repository.save(entity));
        }

        if (entity.getStatus() == ShowtimeSeatStatus.AVAILABLE) {
            return toResponse(entity);
        }

        if (entity.getStatus() != ShowtimeSeatStatus.HELD) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Only held seats can be released");
        }

        if (entity.getHeldByUser() == null || !userId.equals(entity.getHeldByUser().getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Seat hold belongs to another user");
        }

        clearHold(entity);
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", allEntries = true)
    public ShowtimeSeatResponse create(ShowtimeSeatCreateRequest request) {
        ShowtimeSeat entity = showtimeSeatMapper.toEntity(request);
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", allEntries = true)
    public ShowtimeSeatResponse update(UUID id, ShowtimeSeatUpdateRequest request) {
        ShowtimeSeat entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", id.toString()));
        showtimeSeatMapper.updateEntityFromRequest(request, entity);
        return toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "showtimeseats", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }

    private boolean releaseIfExpired(ShowtimeSeat entity, ZonedDateTime now) {
        if (entity.getStatus() == ShowtimeSeatStatus.HELD
                && entity.getHoldExpiresAt() != null
                && !entity.getHoldExpiresAt().isAfter(now)) {
            clearHold(entity);
            return true;
        }
        return false;
    }

    private void clearHold(ShowtimeSeat entity) {
        entity.setStatus(ShowtimeSeatStatus.AVAILABLE);
        entity.setHeldByUser(null);
        entity.setHoldToken(null);
        entity.setHeldAt(null);
        entity.setHoldExpiresAt(null);
    }

    private ShowtimeSeatResponse toResponse(ShowtimeSeat entity) {
        ShowtimeSeatResponse response = showtimeSeatMapper.toResponse(entity);
        if (response == null) {
            response = new ShowtimeSeatResponse();
        }

        if (entity.getShowtime() != null) {
            response.setShowtimeId(entity.getShowtime().getId());
        }

        Seat seat = entity.getSeat();
        if (seat != null) {
            response.setSeatId(seat.getId());
            response.setName(seat.getDisplayName());
            response.setRowLabel(seat.getRowLabel());
            response.setRow(seat.getYPosition());
            response.setCol(seat.getSeatNumber());
            if (seat.getSeatType() != null) {
                response.setSeatType(seat.getSeatType().getCode());
            }
        }

        UUID heldByUserId = entity.getHeldByUser() == null ? null : entity.getHeldByUser().getId();
        response.setHeldByUserId(heldByUserId);
        response.setLockedByUserId(heldByUserId);
        if (entity.getBooking() != null) {
            response.setBookingId(entity.getBooking().getId());
        }
        return response;
    }
}
