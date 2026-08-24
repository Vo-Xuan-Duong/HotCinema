package com.example.cinema.repository;

import com.example.cinema.entity.Ticket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, UUID> {

    Page<Ticket> findAllByIsActiveTrue(Pageable pageable);

    Optional<Ticket> findByIdAndIsActiveTrue(UUID id);

    Optional<Ticket> findByIdAndBooking_User_IdAndIsActiveTrue(UUID id, UUID userId);

    List<Ticket> findAllByBooking_IdAndIsActiveTrue(UUID bookingId);

    List<Ticket> findAllByBooking_IdAndBooking_User_IdAndIsActiveTrue(UUID bookingId, UUID userId);

    Optional<Ticket> findByQrTokenAndIsActiveTrue(UUID qrToken);

    boolean existsByBookingSeat_IdAndIsActiveTrue(UUID bookingSeatId);
}
