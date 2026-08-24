package com.example.cinema.repository;

import com.example.cinema.entity.BookingSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface BookingSeatRepository extends JpaRepository<BookingSeat, UUID> {

    void deleteAllByBooking_Id(UUID bookingId);
}
