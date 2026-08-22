package com.example.cinema.service;

import com.example.cinema.common.response.PageResponse;

import com.example.cinema.entity.Product;
import com.example.cinema.dto.product.ProductResponse;
import java.util.List;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ProductService {
    List<ProductResponse> findAll();
    PageResponse<ProductResponse> findPage(Pageable pageable);
    Optional<Product> findById(UUID id);
    Product save(Product entity);
    void deleteById(UUID id);
}
