package com.example.cinema.repository;

import com.example.cinema.entity.BookingPromotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BookingPromotionRepository extends JpaRepository<BookingPromotion, UUID> {

    long countByPromotion_Id(UUID promotionId);

    long countByPromotion_IdAndBooking_User_Id(UUID promotionId, UUID userId);

    List<BookingPromotion> findAllByBooking_Id(UUID bookingId);

    void deleteAllByBooking_Id(UUID bookingId);
}
