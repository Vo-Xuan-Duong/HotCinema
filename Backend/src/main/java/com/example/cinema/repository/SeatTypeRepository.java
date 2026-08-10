package com.example.cinema.repository;

import com.example.cinema.entity.SeatType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SeatTypeRepository extends JpaRepository<SeatType, UUID> {
}
