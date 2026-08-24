package com.example.cinema.repository;

import com.example.cinema.entity.EmployeeCinema;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeCinemaRepository extends JpaRepository<EmployeeCinema, UUID> {

    Optional<EmployeeCinema> findByIdAndIsActiveTrue(UUID id);

    boolean existsByUser_IdAndCinema_IdAndIsActiveTrue(UUID userId, UUID cinemaId);
}
