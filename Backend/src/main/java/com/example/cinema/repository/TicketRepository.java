package com.example.cinema.repository;

import com.example.cinema.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    Page<Ticket> findAllByIsActiveTrue(Pageable pageable);

    Optional<Ticket> findByIdAndIsActiveTrue(UUID id);
}
