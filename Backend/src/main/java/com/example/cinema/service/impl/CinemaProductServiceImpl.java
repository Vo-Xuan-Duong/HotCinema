package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductCreateRequest;
import com.example.cinema.dto.cinemaproduct.CinemaProductResponse;
import com.example.cinema.dto.cinemaproduct.CinemaProductUpdateRequest;
import com.example.cinema.entity.CinemaProduct;
import com.example.cinema.exception.AppException;
import com.example.cinema.exception.ErrorCode;
import com.example.cinema.exception.ResourceNotFoundException;
import com.example.cinema.mapper.CinemaProductMapper;
import com.example.cinema.repository.CinemaProductRepository;
import com.example.cinema.repository.CinemaRepository;
import com.example.cinema.repository.ProductRepository;
import com.example.cinema.service.CinemaProductService;
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
public class CinemaProductServiceImpl implements CinemaProductService {

    private final CinemaProductRepository repository;
    private final CinemaRepository cinemaRepository;
    private final ProductRepository productRepository;
    private final CinemaProductMapper cinemaProductMapper;

    @Override
    @Transactional(readOnly = true)
    public List<CinemaProductResponse> findAll() {
        return cinemaProductMapper.toResponseList(repository.findAllByIsActiveTrue(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CinemaProductResponse> findAvailableByCinema(UUID cinemaId) {
        if (!cinemaRepository.findByIdAndIsActiveTrue(cinemaId).isPresent()) {
            throw new ResourceNotFoundException("Cinema", cinemaId.toString());
        }
        return cinemaProductMapper.toResponseList(repository.findAvailableByCinemaId(cinemaId));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CinemaProductResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAllByIsActiveTrue(pageable).map(cinemaProductMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "cinemaproducts", key = "#id")
    public CinemaProductResponse findById(UUID id) {
        return repository.findByIdAndIsActiveTrue(id)
                .map(cinemaProductMapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaProduct", id.toString()));
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemaproducts", allEntries = true)
    public CinemaProductResponse create(CinemaProductCreateRequest request) {
        CinemaProduct entity = cinemaProductMapper.toEntity(request);
        applyRelations(entity, request.getCinemaId(), request.getProductId());
        return cinemaProductMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemaproducts", allEntries = true)
    public CinemaProductResponse update(UUID id, CinemaProductUpdateRequest request) {
        CinemaProduct entity = repository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("CinemaProduct", id.toString()));
        cinemaProductMapper.updateEntityFromRequest(request, entity);
        applyRelations(entity, request.getCinemaId(), request.getProductId());
        return cinemaProductMapper.toResponse(repository.save(entity));
    }

    @Override
    @Transactional
    @CacheEvict(value = "cinemaproducts", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsActiveTrue(id).ifPresent(entity -> {
            entity.setActive(false);
            repository.save(entity);
        });
    }

    private void applyRelations(CinemaProduct entity, UUID cinemaId, UUID productId) {
        if (cinemaId == null || productId == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Cinema and product are required");
        }
        entity.setCinema(cinemaRepository.findByIdAndIsActiveTrue(cinemaId)
                .orElseThrow(() -> new ResourceNotFoundException("Cinema", cinemaId.toString())));
        entity.setProduct(productRepository.findByIdAndIsActiveTrue(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", productId.toString())));
    }
}
