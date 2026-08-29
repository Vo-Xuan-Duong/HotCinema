package com.example.cinema.repository;

import com.example.cinema.entity.BookingItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingItemRepository extends JpaRepository<BookingItem, UUID> {

    List<BookingItem> findAllByBooking_Id(UUID bookingId);

    void deleteAllByBooking_Id(UUID bookingId);
}
