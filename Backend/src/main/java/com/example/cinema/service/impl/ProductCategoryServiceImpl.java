package com.example.cinema.service.impl;

import com.example.cinema.common.response.PageMapper;
import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.ProductCategory;
import com.example.cinema.dto.productcategory.ProductCategoryResponse;
import com.example.cinema.mapper.ProductCategoryMapper;
import com.example.cinema.repository.ProductCategoryRepository;
import com.example.cinema.service.ProductCategoryService;
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
public class ProductCategoryServiceImpl implements ProductCategoryService {

    private final ProductCategoryRepository repository;
    private final ProductCategoryMapper productCategoryMapper;

    @Override
    @Transactional(readOnly = true)
    public List<ProductCategoryResponse> findAll() {
        return productCategoryMapper.toResponseList(repository.findAll(Pageable.unpaged()).getContent());
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductCategoryResponse> findPage(Pageable pageable) {
        return PageMapper.toPageResponse(repository.findAll(pageable).map(productCategoryMapper::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "productcategorys", key = "#id")
    public Optional<ProductCategory> findById(UUID id) {
        return repository.findById(id);
    }

    @Override
    @Transactional
    @CacheEvict(value = "productcategorys", key = "#result.id")
    public ProductCategory save(ProductCategory entity) {
        return repository.save(entity);
    }

    @Override
    @Transactional
    @CacheEvict(value = "productcategorys", key = "#id")
    public void deleteById(UUID id) {
        repository.deleteById(id);
    }
}
