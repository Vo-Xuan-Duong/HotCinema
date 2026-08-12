package com.example.cinema.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.example.cinema.entity.TicketScan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

public interface TicketScanRepository extends JpaRepository<TicketScan, UUID> {

Optional<TicketScan> findByIdAndIsDeletedFalse(UUID id);
}