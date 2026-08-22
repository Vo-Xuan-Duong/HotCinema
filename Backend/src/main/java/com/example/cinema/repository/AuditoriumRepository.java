package com.example.cinema.repository;

import com.example.cinema.entity.Auditorium;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuditoriumRepository extends JpaRepository<Auditorium, UUID> {

    Page<Auditorium> findAllByIsActiveTrue(Pageable pageable);

    Optional<Auditorium> findByIdAndIsActiveTrue(UUID id);
}
