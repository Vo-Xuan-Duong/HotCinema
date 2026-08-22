package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Booking;
import com.example.cinema.dto.booking.BookingCreateRequest;
import com.example.cinema.dto.booking.BookingUpdateRequest;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.dto.booking.BookingResponse;
import com.example.cinema.mapper.BookingMapper;
import com.example.cinema.repository.BookingRepository;
import com.example.cinema.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository repository;
    private final BookingMapper bookingMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> findAll() {
        return bookingMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(bookingMapper::toResponse));
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
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse create(BookingCreateRequest request) {
        Booking entity = bookingMapper.toEntity(request);
        return bookingMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookings", allEntries = true)
    public BookingResponse update(UUID id, BookingUpdateRequest request) {
        Booking entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", id.toString()));
        bookingMapper.updateEntityFromRequest(request, entity);
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
}
