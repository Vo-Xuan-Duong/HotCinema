package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.bookingitem.BookingItemCreateRequest;
import com.example.cinema.dto.bookingitem.BookingItemResponse;
import com.example.cinema.dto.bookingitem.BookingItemUpdateRequest;
import com.example.cinema.entity.BookingItem;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.BookingItemMapper;
import com.example.cinema.repository.BookingItemRepository;
import com.example.cinema.service.BookingItemService;
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
public class BookingItemServiceImpl implements BookingItemService {

    private final BookingItemRepository repository;
    private final BookingItemMapper bookingItemMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookingItemResponse> findAll() {
        return bookingItemMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public List<BookingItemResponse> findByBooking(UUID bookingId) {
        return bookingItemMapper.toResponseList(repository.findAllByBooking_Id(bookingId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingItemResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(bookingItemMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookingitems", key = "#id")
    public BookingItemResponse findById(UUID id) {
        return repository.findById(id)
                .map(bookingItemMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("BookingItem", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingitems", allEntries = true)
    public BookingItemResponse create(BookingItemCreateRequest request) {
        BookingItem entity = bookingItemMapper.toEntity(request);
        return bookingItemMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingitems", allEntries = true)
    public BookingItemResponse update(UUID id, BookingItemUpdateRequest request) {
        BookingItem entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("BookingItem", id.toString()));
        bookingItemMapper.updateEntityFromRequest(request, entity);
        return bookingItemMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingitems", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
