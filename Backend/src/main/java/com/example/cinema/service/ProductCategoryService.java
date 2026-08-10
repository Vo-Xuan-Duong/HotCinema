package com.example.cinema.service;

import com.example.cinema.entity.ProductCategory;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductCategoryService {
    List<ProductCategory> findAll();
    Optional<ProductCategory> findById(UUID id);
    ProductCategory save(ProductCategory entity);
    void deleteById(UUID id);
}
