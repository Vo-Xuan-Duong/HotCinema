package com.example.cinema.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

import com.example.cinema.entity.BookingStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository

public interface BookingStatusHistoryRepository extends JpaRepository<BookingStatusHistory, UUID> {

Optional<BookingStatusHistory> findByIdAndIsDeletedFalse(UUID id);
}