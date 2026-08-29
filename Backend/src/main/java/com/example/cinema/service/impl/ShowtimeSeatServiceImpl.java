package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatCreateRequest;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatResponse;
import com.example.cinema.dto.showtimeseat.ShowtimeSeatUpdateRequest;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.BookingItem;
import com.example.cinema.entity.BookingPromotion;
import com.example.cinema.entity.CinemaProduct;
import com.example.cinema.entity.PromotionCode;
import com.example.cinema.entity.Seat;
import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.User;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.ShowtimeSeatMapper;
import com.example.cinema.repository.BookingItemRepository;
import com.example.cinema.repository.BookingPromotionRepository;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.BookingSeatRepository;
import com.example.cinema.repository.CinemaProductRepository;
import com.example.cinema.repository.PromotionCodeRepository;
import com.example.cinema.repository.ShowtimeSeatRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.ShowtimeSeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeSeatServiceImpl implements ShowtimeSeatService {

    private final ShowtimeSeatRepository repository;
    private final ShowtimeSeatMapper showtimeSeatMapper;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final BookingItemRepository bookingItemRepository;
    private final BookingPromotionRepository bookingPromotionRepository;
    private final CinemaProductRepository cinemaProductRepository;
    private final PromotionCodeRepository promotionCodeRepository;
    private final SimpMessagingTemplate messagingTemplate;

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
    @CacheEvict(value = {"showtimeseats", "bookings", "cinemaproducts"}, allEntries = true)
    public List<ShowtimeSeatResponse> findByShowtime(UUID showtimeId) {
        expireHoldsForShowtime(showtimeId, ZonedDateTime.now());
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
    @CacheEvict(value = {"showtimeseats", "bookings"}, allEntries = true)
    public ShowtimeSeatResponse holdSeat(UUID showtimeId, UUID seatId, UUID userId) {
        User user = userRepository.findByIdAndIsActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString()));
        ShowtimeSeat entity = repository.findForUpdate(showtimeId, seatId)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", seatId.toString()));

        ZonedDateTime now = ZonedDateTime.now();
        releaseIfExpired(entity, now);

        if (entity.getBooking() != null) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Seat is already attached to a booking");
        }
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

        ShowtimeSeatResponse response = toResponse(repository.save(entity));
        publishSeatStatusAfterCommit(showtimeId, response);
        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = {"showtimeseats", "bookings", "cinemaproducts"}, allEntries = true)
    public ShowtimeSeatResponse releaseSeat(UUID showtimeId, UUID seatId, UUID userId) {
        ShowtimeSeat entity = repository.findForUpdate(showtimeId, seatId)
                .orElseThrow(() -> new ResourceNotFoundException("ShowtimeSeat", seatId.toString()));

        ZonedDateTime now = ZonedDateTime.now();
        if (releaseIfExpired(entity, now)) {
            return toResponse(entity);
        }
        if (entity.getStatus() == ShowtimeSeatStatus.AVAILABLE) {
            return toResponse(entity);
        }
        if (entity.getBooking() != null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Seat belongs to a pending booking and cannot be released individually");
        }
        if (entity.getStatus() != ShowtimeSeatStatus.HELD) {
            throw new AppException(ErrorCode.DATA_INTEGRITY_VIOLATION, "Only held seats can be released");
        }
        if (entity.getHeldByUser() == null || !userId.equals(entity.getHeldByUser().getId())) {
            throw new AppException(ErrorCode.FORBIDDEN, "Seat hold belongs to another user");
        }

        clearHold(entity);
        ShowtimeSeatResponse response = toResponse(repository.save(entity));
        publishSeatStatusAfterCommit(showtimeId, response);
        return response;
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

    private void expireHoldsForShowtime(UUID showtimeId, ZonedDateTime now) {
        List<ShowtimeSeat> expired = repository.findExpiredHoldsForUpdate(
                showtimeId,
                ShowtimeSeatStatus.HELD,
                now
        );
        Set<UUID> expiredBookings = new HashSet<>();

        for (ShowtimeSeat seat : expired) {
            Booking booking = seat.getBooking();
            if (booking != null && booking.getStatus() == BookingStatus.PENDING_PAYMENT) {
                if (expiredBookings.add(booking.getId())) {
                    expireBooking(booking, now);
                }
            } else if (seat.getStatus() == ShowtimeSeatStatus.HELD) {
                clearHold(seat);
                seat.setBooking(null);
                ShowtimeSeatResponse response = toResponse(repository.save(seat));
                publishSeatStatusAfterCommit(showtimeId, response);
            }
        }
    }

    private boolean releaseIfExpired(ShowtimeSeat entity, ZonedDateTime now) {
        if (entity.getStatus() != ShowtimeSeatStatus.HELD
                || entity.getHoldExpiresAt() == null
                || entity.getHoldExpiresAt().isAfter(now)) {
            return false;
        }

        Booking booking = entity.getBooking();
        if (booking != null && booking.getStatus() == BookingStatus.PENDING_PAYMENT) {
            expireBooking(booking, now);
        } else {
            UUID showtimeId = entity.getShowtime().getId();
            clearHold(entity);
            entity.setBooking(null);
            ShowtimeSeatResponse response = toResponse(repository.save(entity));
            publishSeatStatusAfterCommit(showtimeId, response);
        }
        return true;
    }

    private void expireBooking(Booking booking, ZonedDateTime now) {
        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            return;
        }

        Booking lockedBooking = bookingRepository.findByIdForUpdate(booking.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", booking.getId().toString()));
        if (lockedBooking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            return;
        }

        List<ShowtimeSeat> bookingSeats = repository.findAllByBookingIdForUpdate(lockedBooking.getId());
        for (ShowtimeSeat seat : bookingSeats) {
            UUID showtimeId = seat.getShowtime().getId();
            clearHold(seat);
            seat.setBooking(null);
            ShowtimeSeatResponse response = toResponse(seat);
            publishSeatStatusAfterCommit(showtimeId, response);
        }
        repository.saveAll(bookingSeats);

        restoreConcessionInventory(lockedBooking);
        bookingItemRepository.deleteAllByBooking_Id(lockedBooking.getId());
        bookingSeatRepository.deleteAllByBooking_Id(lockedBooking.getId());
        releasePromotionReservation(lockedBooking.getId());
        lockedBooking.setStatus(BookingStatus.EXPIRED);
        lockedBooking.setCancelledAt(null);
        bookingRepository.save(lockedBooking);
    }

    private void restoreConcessionInventory(Booking booking) {
        if (booking.getShowtime() == null
                || booking.getShowtime().getAuditorium() == null
                || booking.getShowtime().getAuditorium().getCinema() == null) {
            return;
        }

        UUID cinemaId = booking.getShowtime().getAuditorium().getCinema().getId();
        List<BookingItem> items = bookingItemRepository.findAllByBooking_Id(booking.getId());
        for (BookingItem item : items) {
            if (item.getProduct() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                continue;
            }
            CinemaProduct cinemaProduct = cinemaProductRepository
                    .findByCinemaAndProductForUpdate(cinemaId, item.getProduct().getId())
                    .orElse(null);
            if (cinemaProduct != null && cinemaProduct.getStockQuantity() != null) {
                cinemaProduct.setStockQuantity(cinemaProduct.getStockQuantity() + item.getQuantity());
                cinemaProductRepository.save(cinemaProduct);
            }
        }
    }

    private void releasePromotionReservation(UUID bookingId) {
        List<BookingPromotion> reservations = bookingPromotionRepository.findAllByBooking_Id(bookingId);
        for (BookingPromotion reservation : reservations) {
            PromotionCode code = reservation.getPromotionCode();
            if (code == null) {
                continue;
            }
            PromotionCode lockedCode = promotionCodeRepository.findByIdForUpdate(code.getId()).orElse(code);
            int usedCount = lockedCode.getUsedCount() == null ? 0 : lockedCode.getUsedCount();
            if (usedCount > 0) {
                lockedCode.setUsedCount(usedCount - 1);
                promotionCodeRepository.save(lockedCode);
            }
        }
        bookingPromotionRepository.deleteAllByBooking_Id(bookingId);
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
        } else {
            response.setBookingId(null);
        }
        return response;
    }

    private void publishSeatStatusAfterCommit(UUID showtimeId, ShowtimeSeatResponse response) {
        Runnable publish = () -> messagingTemplate.convertAndSend(
                "/topic/showtimes/" + showtimeId,
                new SeatStatusEvent(response.getId(), response.getStatus().name(), response.getHeldByUserId())
        );

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    publish.run();
                }
            });
        } else {
            publish.run();
        }
    }

    private record SeatStatusEvent(UUID seatId, String status, UUID userId) {}
}
