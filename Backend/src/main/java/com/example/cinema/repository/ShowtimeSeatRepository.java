package com.example.cinema.repository;

import com.example.cinema.entity.ShowtimeSeat;
import com.example.cinema.entity.enums.ShowtimeSeatStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, UUID> {

    Page<ShowtimeSeat> findAllByIsActiveTrue(Pageable pageable);

    Optional<ShowtimeSeat> findByIdAndIsActiveTrue(UUID id);

    List<ShowtimeSeat> findAllByShowtime_IdAndIsActiveTrue(UUID showtimeId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select ss from ShowtimeSeat ss where ss.id = :seatId and ss.isActive = true")
    Optional<ShowtimeSeat> findByIdForUpdate(@Param("seatId") UUID seatId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select ss from ShowtimeSeat ss
            where ss.id = :seatId
              and ss.showtime.id = :showtimeId
              and ss.isActive = true
            """)
    Optional<ShowtimeSeat> findForUpdate(
            @Param("showtimeId") UUID showtimeId,
            @Param("seatId") UUID seatId
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select ss from ShowtimeSeat ss
            where ss.booking.id = :bookingId
              and ss.isActive = true
            order by ss.id
            """)
    List<ShowtimeSeat> findAllByBookingIdForUpdate(@Param("bookingId") UUID bookingId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select ss from ShowtimeSeat ss
            where ss.showtime.id = :showtimeId
              and ss.status = :heldStatus
              and ss.holdExpiresAt <= :now
              and ss.isActive = true
            order by ss.id
            """)
    List<ShowtimeSeat> findExpiredHoldsForUpdate(
            @Param("showtimeId") UUID showtimeId,
            @Param("heldStatus") ShowtimeSeatStatus heldStatus,
            @Param("now") ZonedDateTime now
    );

    @Query("""
            select distinct ss.showtime.id from ShowtimeSeat ss
            where ss.status = :heldStatus
              and ss.holdExpiresAt <= :now
              and ss.isActive = true
            """)
    List<UUID> findShowtimeIdsWithExpiredHolds(
            @Param("heldStatus") ShowtimeSeatStatus heldStatus,
            @Param("now") ZonedDateTime now
    );

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("""
            update ShowtimeSeat ss
               set ss.status = :availableStatus,
                   ss.heldByUser = null,
                   ss.holdToken = null,
                   ss.heldAt = null,
                   ss.holdExpiresAt = null,
                   ss.version = ss.version + 1
             where ss.showtime.id = :showtimeId
               and ss.status = :heldStatus
               and ss.holdExpiresAt <= :now
               and ss.isActive = true
            """)
    int releaseExpiredHolds(
            @Param("showtimeId") UUID showtimeId,
            @Param("heldStatus") ShowtimeSeatStatus heldStatus,
            @Param("availableStatus") ShowtimeSeatStatus availableStatus,
            @Param("now") ZonedDateTime now
    );
}
