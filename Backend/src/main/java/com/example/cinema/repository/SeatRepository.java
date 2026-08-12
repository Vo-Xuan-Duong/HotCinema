package com.example.cinema.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.example.cinema.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

public interface SeatRepository extends JpaRepository<Seat, UUID> {

    Page<Seat> findAllByIsDeletedFalse(Pageable pageable);

    Optional<Seat> findByIdAndIsDeletedFalse(UUID id);
}