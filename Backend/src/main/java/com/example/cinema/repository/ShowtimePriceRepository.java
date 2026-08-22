package com.example.cinema.repository;

import com.example.cinema.entity.ShowtimePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ShowtimePriceRepository extends JpaRepository<ShowtimePrice, UUID> {
}
