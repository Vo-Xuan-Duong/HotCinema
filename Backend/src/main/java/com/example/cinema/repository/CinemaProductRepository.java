package com.example.cinema.repository;

import com.example.cinema.entity.CinemaProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CinemaProductRepository extends JpaRepository<CinemaProduct, UUID> {
}
