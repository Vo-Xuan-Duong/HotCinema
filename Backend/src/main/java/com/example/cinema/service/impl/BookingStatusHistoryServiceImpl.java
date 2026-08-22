package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.BookingStatusHistory;
import com.example.cinema.dto.bookingstatushistory.BookingStatusHistoryResponse;
import com.example.cinema.mapper.BookingStatusHistoryMapper;
import com.example.cinema.repository.BookingStatusHistoryRepository;
import com.example.cinema.service.BookingStatusHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingStatusHistoryServiceImpl implements BookingStatusHistoryService {

    private final BookingStatusHistoryRepository repository;
    private final BookingStatusHistoryMapper bookingStatusHistoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookingStatusHistoryResponse> findAll() {
        return bookingStatusHistoryMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingStatusHistoryResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(bookingStatusHistoryMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookingstatushistorys", key = "#id")
    public Optional<BookingStatusHistory> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingstatushistorys", key = "#result.id")
    public BookingStatusHistory save(BookingStatusHistory entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingstatushistorys", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
