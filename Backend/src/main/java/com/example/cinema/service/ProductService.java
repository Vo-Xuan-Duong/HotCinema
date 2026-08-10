package com.example.cinema.service;

import com.example.cinema.entity.Product;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductService {
    List<Product> findAll();
    Optional<Product> findById(UUID id);
    Product save(Product entity);
    void deleteById(UUID id);
}
