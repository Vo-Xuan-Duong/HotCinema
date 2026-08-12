package com.example.cinema.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.example.cinema.entity.Cinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

public interface CinemaRepository extends JpaRepository<Cinema, UUID> {

    Page<Cinema> findAllByIsDeletedFalse(Pageable pageable);

    Optional<Cinema> findByIdAndIsDeletedFalse(UUID id);
}