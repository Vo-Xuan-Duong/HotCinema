package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.dto.product.ProductCreateRequest;
import com.example.cinema.dto.product.ProductUpdateRequest;
import com.example.cinema.dto.product.ProductResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.UUID;

public interface ProductService {
    List<ProductResponse> findAll();
    PageResponse<ProductResponse> findPage(Pageable pageable);
    ProductResponse findById(UUID id);
    ProductResponse create(ProductCreateRequest request);
    ProductResponse update(UUID id, ProductUpdateRequest request);
    void deleteById(UUID id);
}
