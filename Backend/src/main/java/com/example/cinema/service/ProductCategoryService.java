package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.ProductCategory;
import com.example.cinema.dto.productcategory.ProductCategoryResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ProductCategoryService {
    List<ProductCategoryResponse> findAll();
    PageResponse<ProductCategoryResponse> findPage(Pageable pageable);
    Optional<ProductCategory> findById(UUID id);
    ProductCategory save(ProductCategory entity);
    void deleteById(UUID id);
}
