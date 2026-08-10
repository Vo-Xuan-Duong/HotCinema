package com.example.cinema.service.impl;

import com.example.cinema.entity.ProductCategory;
import com.example.cinema.repository.ProductCategoryRepository;
import com.example.cinema.service.ProductCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryRepository repository;

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategory> findAll() {
        return repository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ProductCategory> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    public ProductCategory save(ProductCategory entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
