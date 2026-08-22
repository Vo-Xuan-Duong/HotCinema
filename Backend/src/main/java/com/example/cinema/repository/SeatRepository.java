package com.example.cinema.repository;

import com.example.cinema.entity.Seat;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SeatRepository extends JpaRepository<Seat, UUID> {

    Page<Seat> findAllByIsActiveTrue(Pageable pageable);

    Optional<Seat> findByIdAndIsActiveTrue(UUID id);
}
