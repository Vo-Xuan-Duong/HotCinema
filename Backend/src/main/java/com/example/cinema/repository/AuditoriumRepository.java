package com.example.cinema.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.example.cinema.entity.Auditorium;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

public interface AuditoriumRepository extends JpaRepository<Auditorium, UUID> {

    Page<Auditorium> findAllByIsDeletedFalse(Pageable pageable);

    Optional<Auditorium> findByIdAndIsDeletedFalse(UUID id);
}