package com.example.cinema.service;

import com.example.cinema.entity.ProductCategory;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ProductCategoryService {
    Page<ProductCategory> findAll(Pageable pageable);
    Optional<ProductCategory> findById(UUID id);
    ProductCategory save(ProductCategory entity);
    void deleteById(UUID id);
}
