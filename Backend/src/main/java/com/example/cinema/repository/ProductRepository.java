package com.example.cinema.repository;

import com.example.cinema.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Page<Product> findAllByIsActiveTrue(Pageable pageable);

    Optional<Product> findByIdAndIsActiveTrue(UUID id);
}
