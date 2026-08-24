package com.example.cinema.repository;

import com.example.cinema.entity.Showtime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, UUID>, JpaSpecificationExecutor<Showtime> {

    Page<Showtime> findAllByIsActiveTrue(Pageable pageable);

    Optional<Showtime> findByIdAndIsActiveTrue(UUID id);
}
