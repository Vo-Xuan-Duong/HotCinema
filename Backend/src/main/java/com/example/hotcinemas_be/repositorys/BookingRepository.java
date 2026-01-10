package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.enums.BookingStatus;
import com.example.hotcinemas_be.models.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {

        /**
         * Find booking by booking code
         */
        Optional<Booking> findByBookingCode(String bookingCode);

        /**
         * Find all bookings by user ID
         */
        List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

        /**
         * Find all bookings by user ID with pagination
         */
        Page<Booking> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

        /**
         * Find all bookings by showtime ID
         */
        List<Booking> findByShowtimeIdOrderByCreatedAtDesc(Long showtimeId);

        /**
         * Find all bookings by status
         */
        List<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status);

        /**
         * Find all bookings by status with pagination
         */
        Page<Booking> findByStatusOrderByCreatedAtDesc(BookingStatus status, Pageable pageable);

        /**
         * Find bookings by user ID and status
         */
        List<Booking> findByUserIdAndStatusOrderByCreatedAtDesc(Long userId, BookingStatus status);

        /**
         * Find bookings by showtime ID and status
         */
        List<Booking> findByShowtimeIdAndStatusOrderByCreatedAtDesc(Long showtimeId, BookingStatus status);

        /**
         * Find bookings created between dates
         */
        List<Booking> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime startDate, LocalDateTime endDate);

        /**
         * Find bookings by user ID and date range
         */
        List<Booking> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(Long userId, LocalDateTime startDate,
                        LocalDateTime endDate);

        /**
         * Count bookings by user ID
         */
        long countByUserId(Long userId);

        /**
         * Count bookings by showtime ID
         */
        long countByShowtimeId(Long showtimeId);

        /**
         * Count bookings by status
         */
        long countByStatus(BookingStatus status);

        /**
         * Count bookings by user ID and status
         */
        long countByUserIdAndStatus(Long userId, BookingStatus status);

        /**
         * Find bookings with total amount greater than specified value
         */
        List<Booking> findByTotalAmountGreaterThanOrderByTotalAmountDesc(java.math.BigDecimal amount);

        /**
         * Find bookings by user ID with total amount greater than specified value
         */
        List<Booking> findByUserIdAndTotalAmountGreaterThanOrderByTotalAmountDesc(Long userId,
                        java.math.BigDecimal amount);

        /**
         * Get booking statistics for a user
         */
        @Query("SELECT " +
                        "COUNT(b) as totalBookings, " +
                        "SUM(b.totalAmount) as totalSpent, " +
                        "AVG(b.totalAmount) as averageAmount, " +
                        "COUNT(CASE WHEN b.status = 'CONFIRMED' THEN 1 END) as confirmedBookings, " +
                        "COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelledBookings " +
                        "FROM Booking b WHERE b.user.id = :userId")
        Object[] getBookingStatisticsByUserId(@Param("userId") Long userId);

        /**
         * Get booking statistics for a showtime
         */
        @Query("SELECT " +
                        "COUNT(b) as totalBookings, " +
                        "SUM(b.totalAmount) as totalRevenue, " +
                        "AVG(b.totalAmount) as averageAmount, " +
                        "COUNT(CASE WHEN b.status = 'CONFIRMED' THEN 1 END) as confirmedBookings, " +
                        "COUNT(CASE WHEN b.status = 'CANCELLED' THEN 1 END) as cancelledBookings " +
                        "FROM Booking b WHERE b.showtime.id = :showtimeId")
        Object[] getBookingStatisticsByShowtimeId(@Param("showtimeId") Long showtimeId);

        /**
         * Find bookings by booking date range
         */
        List<Booking> findByBookingDateBetweenOrderByBookingDateDesc(LocalDateTime startDate, LocalDateTime endDate);

        /**
         * Find recent bookings (last N days)
         */
        @Query("SELECT b FROM Booking b WHERE b.createdAt >= :startDate ORDER BY b.createdAt DESC")
        List<Booking> findRecentBookings(@Param("startDate") LocalDateTime startDate);

        /**
         * Check if booking code exists
         */
        boolean existsByBookingCode(String bookingCode);

        /**
         * Find bookings by multiple statuses
         */
        List<Booking> findByStatusInOrderByCreatedAtDesc(List<BookingStatus> statuses);

        /**
         * Find bookings by user ID and multiple statuses
         */
        List<Booking> findByUserIdAndStatusInOrderByCreatedAtDesc(Long userId, List<BookingStatus> statuses);

        /**
         * Get total revenue by date range
         */
        @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.bookingDate BETWEEN :startDate AND :endDate AND b.status = 'CONFIRMED'")
        java.math.BigDecimal getTotalRevenueByDateRange(@Param("startDate") LocalDateTime startDate,
                        @Param("endDate") LocalDateTime endDate);

        /**
         * Get total revenue by user ID and date range
         */
        @Query("SELECT SUM(b.totalAmount) FROM Booking b WHERE b.user.id = :userId AND b.bookingDate BETWEEN :startDate AND :endDate AND b.status = 'CONFIRMED'")
        java.math.BigDecimal getTotalRevenueByUserIdAndDateRange(@Param("userId") Long userId,
                        @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

        List<Booking> findBookingsByShowtimeId(Long showtimeId);

        List<Booking> findBookingsByUserId(Long userId);

        List<Booking> findBookingsByStatus(BookingStatus status);

        List<Booking> findByShowtimeId(Long showtimeId);

        Page<Booking> findBookingsByUserIdOrderByBookingDateDesc(Long userId, Pageable pageable);

        /**
         * Find bookings by status and created before a specific time
         */
        List<Booking> findByStatusAndCreatedAtBefore(BookingStatus status, LocalDateTime dateTime);
}
