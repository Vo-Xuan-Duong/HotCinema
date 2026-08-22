package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.BookingPromotion;
import com.example.cinema.dto.bookingpromotion.BookingPromotionResponse;
import com.example.cinema.mapper.BookingPromotionMapper;
import com.example.cinema.repository.BookingPromotionRepository;
import com.example.cinema.service.BookingPromotionService;
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
public class BookingPromotionServiceImpl implements BookingPromotionService {

    private final BookingPromotionRepository repository;
    private final BookingPromotionMapper bookingPromotionMapper;

    @Override
    @Transactional(readOnly = true)
    public List<BookingPromotionResponse> findAll() {
        return bookingPromotionMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<BookingPromotionResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(bookingPromotionMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "bookingpromotions", key = "#id")
    public Optional<BookingPromotion> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingpromotions", key = "#result.id")
    public BookingPromotion save(BookingPromotion entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "bookingpromotions", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
