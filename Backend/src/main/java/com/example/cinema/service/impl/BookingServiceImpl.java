package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.entity.Booking;
import com.example.cinema.entity.enums.BookingStatus;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.repository.ShowtimeRepository;
import com.example.cinema.repository.UserRepository;
import com.example.cinema.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repository;
    private final BookingMapper bookingMapper;
    private final UserRepository userRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAllByUser(UUID userId) {
        return bookingMapper.toResponseList(
                repository.findAllByUser_IdAndIsActiveTrue(userId, Pageable.unpaged()).getContent()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(bookingMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findPageByUser(UUID userId, Pageable pageable) {
        return PageMapper.toPageResponse(
                repository.findAllByUser_IdAndIsActiveTrue(userId, pageable).map(bookingMapper::toResponse)
        );
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookings", key = "#id")
    public BookingResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findByIdForUser(UUID id, UUID userId) {
        return repository.findByIdAndUser_IdAndIsActiveTrue(id, userId)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findByCode(String bookingCode) {
        return repository.findByBookingCodeIgnoreCaseAndIsActiveTrue(bookingCode)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingCode));
    }

    @Override
    @Transactional(readOnly = true)
    public BookingResponse findByCodeForUser(String bookingCode, UUID userId) {
        return repository.findByBookingCodeIgnoreCaseAndUser_IdAndIsActiveTrue(bookingCode, userId)
                .map(bookingMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", bookingCode));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse create(BookingCreateRequest request) {
        Booking entity = bookingMapper.toEntity(request);
        applyRelations(entity, request.getUserId(), request.getShowtimeId());
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse createForUser(BookingCreateRequest request, UUID userId) {
        Booking entity = bookingMapper.toEntity(request);
        applyRelations(entity, userId, request.getShowtimeId());
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse update(UUID id, BookingUpdateRequest request) {
        Booking entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        bookingMapper.updateEntityFromRequest(request, entity);
        applyRelations(entity, request.getUserId(), request.getShowtimeId());
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse updateStatus(UUID id, BookingStatus status) {
        Booking entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        entity.setStatus(status);
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }

    private void applyRelations(Booking entity, UUID userId, UUID showtimeId) {
        if (userId == null) {
            entity.setUser(null);
        } else {
            entity.setUser(userRepository.findByIdAndIsActiveTrue(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", userId.toString())));
        }

        entity.setShowtime(showtimeRepository.findByIdAndIsActiveTrue(showtimeId)
                .orElseThrow(() -> new ResourceNotFoundException("Showtime", showtimeId.toString())));
    }
}
