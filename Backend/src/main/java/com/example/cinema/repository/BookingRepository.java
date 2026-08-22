package com.example.cinema.repository;

import com.example.cinema.entity.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {

    Page<Booking> findAllByIsActiveTrue(Pageable pageable);

    Optional<Booking> findByIdAndIsActiveTrue(UUID id);
}
