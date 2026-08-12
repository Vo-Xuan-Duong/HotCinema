package com.example.cinema.service.impl;

import com.example.cinema.entity.Product;
import com.example.cinema.repository.ProductRepository;
import com.example.cinema.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.ZonedDateTime;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository repository;

    @Override
    @Transactional(readOnly = true)
    public Page<Product> findAll(Pageable pageable) {
        return repository.findAllByIsDeletedFalse(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "products", key = "#id")
    public Optional<Product> findById(UUID id) {
        return repository.findByIdAndIsDeletedFalse(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#result.id")
    public Product save(Product entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "products", key = "#id")
    public void deleteById(UUID id) {
        repository.findByIdAndIsDeletedFalse(id).ifPresent(entity -> {
            entity.setDeleted(true);
            entity.setDeletedAt(ZonedDateTime.now());
            repository.save(entity);
        });
    }
}
