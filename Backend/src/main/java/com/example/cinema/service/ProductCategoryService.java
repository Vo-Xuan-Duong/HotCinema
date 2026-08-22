package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.productcategory.ProductCategoryCreateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryUpdateRequest;
import com.example.cinema.dto.productcategory.ProductCategoryResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ProductCategoryService {
    List<ProductCategoryResponse> findAll();
    PageResponse<ProductCategoryResponse> findPage(Pageable pageable);
    ProductCategoryResponse findById(UUID id);
    ProductCategoryResponse create(ProductCategoryCreateRequest request);
    ProductCategoryResponse update(UUID id, ProductCategoryUpdateRequest request);
    void deleteById(UUID id);
}
