package com.example.cinema.service;

import com.example.cinema.entity.Product;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface ProductService {
    Page<Product> findAll(Pageable pageable);
    Optional<Product> findById(UUID id);
    Product save(Product entity);
    void deleteById(UUID id);
}
