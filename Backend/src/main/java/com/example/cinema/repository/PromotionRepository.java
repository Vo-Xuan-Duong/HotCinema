package com.example.cinema.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.example.cinema.entity.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

public interface PromotionRepository extends JpaRepository<Promotion, UUID> {

    Page<Promotion> findAllByIsDeletedFalse(Pageable pageable);

    Optional<Promotion> findByIdAndIsDeletedFalse(UUID id);
}