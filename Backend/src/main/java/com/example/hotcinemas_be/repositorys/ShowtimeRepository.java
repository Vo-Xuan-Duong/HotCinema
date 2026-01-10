package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Showtime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {
        Page<Showtime> findByMovie_Id(Long movieId, Pageable pageable);

        List<Showtime> findByMovie_Id(Long movieId);

        Page<Showtime> findByTheater_Id(Long theaterId, Pageable pageable);

        List<Showtime> findByTheater_Id(Long theaterId);

        Optional<Showtime> findByMovie_IdAndTheater_IdAndStartTimeAndEndTime(Long movie_id, Long theater_id,
                        LocalTime startTime, LocalTime endTime);

        Boolean existsByTheater_IdAndStartTimeAndEndTime(Long theater_id, LocalTime startTime, LocalTime endTime);

        // Detect any overlap where existing.startTime < newEnd AND existing.endTime >
        // newStart
        @Query("SELECT COUNT(s) > 0 FROM Showtime s WHERE s.theater.id = :theaterId " +
                        "AND s.showDate = :date " +
                        "AND s.startTime < :endTime " +
                        "AND s.endTime > :startTime")
        boolean existsOverlapping(Long theaterId, LocalDate date, LocalTime startTime, LocalTime endTime);

        List<Showtime> findByStatusAndShowDateAndStartTimeLessThanEqual(
                        com.example.hotcinemas_be.enums.ShowtimeStatus status, LocalDate date, LocalTime now);

        List<Showtime> findByStatusAndShowDateAndEndTimeLessThanEqual(
                        com.example.hotcinemas_be.enums.ShowtimeStatus status, LocalDate date, LocalTime now);

        List<Showtime> findByStatusAndShowDateLessThan(
                        com.example.hotcinemas_be.enums.ShowtimeStatus status, LocalDate date);

        List<Showtime> findByStatusIn(java.util.Collection<com.example.hotcinemas_be.enums.ShowtimeStatus> statuses);

        List<Showtime> findByStatusAndShowDateBefore(com.example.hotcinemas_be.enums.ShowtimeStatus status,
                        LocalDate date);

        // Query phức tạp để lọc showtime theo nhiều tiêu chí
        @Query("SELECT s FROM Showtime s " +
                        "JOIN s.theater r " +
                        "JOIN r.cinema c " +
                        "JOIN c.region region " +
                        "WHERE (:movieId IS NULL OR s.movie.id = :movieId) " +
                        "AND (:cinemaAddress IS NULL OR LOWER(c.address) LIKE LOWER(CONCAT('%', :cinemaAddress, '%'))) "
                        +
                        "AND (:cinemaRegion IS NULL OR LOWER(region.name) LIKE LOWER(CONCAT('%', :cinemaRegion, '%'))) "
                        +
                        "AND (:cinemaId IS NULL OR c.id = :cinemaId) " +
                        "AND (:showDate IS NULL OR s.showDate = :showDate) " +
                        "AND (:format IS NULL OR s.format = :format)")
        List<Showtime> findShowtimesWithFilters(
                        @Param("movieId") Long movieId,
                        @Param("cinemaAddress") String cinemaAddress,
                        @Param("cinemaRegion") String cinemaRegion,
                        @Param("cinemaId") Long cinemaId,
                        @Param("showDate") LocalDate showDate,
                        @Param("format") com.example.hotcinemas_be.enums.Format format);

        @Query("SELECT s FROM Showtime s " +
                        "JOIN s.theater r " +
                        "JOIN r.cinema c " +
                        "JOIN c.region region " +
                        "WHERE (:movieId IS NULL OR s.movie.id = :movieId) " +
                        "AND (:cinemaAddress IS NULL OR LOWER(c.address) LIKE LOWER(CONCAT('%', :cinemaAddress, '%'))) "
                        +
                        "AND (:cinemaRegion IS NULL OR LOWER(region.name) LIKE LOWER(CONCAT('%', :cinemaRegion, '%'))) "
                        +
                        "AND (:showDate IS NULL OR s.showDate = :showDate) " +
                        "AND (:format IS NULL OR s.format = :format)")
        Page<Showtime> findShowtimesWithFiltersPaged(
                        @Param("movieId") Long movieId,
                        @Param("cinemaAddress") String cinemaAddress,
                        @Param("cinemaRegion") String cinemaRegion,
                        @Param("showDate") LocalDate showDate,
                        @Param("format") com.example.hotcinemas_be.enums.Format format,
                        Pageable pageable);

        // Query to get distinct cinemas showing a movie on a specific date
        @Query("SELECT DISTINCT c.id FROM Showtime s " +
                        "JOIN s.theater r " +
                        "JOIN r.cinema c " +
                        "WHERE s.movie.id = :movieId " +
                        "AND s.showDate = :showDate " +
                        "ORDER BY c.id")
        Page<Long> findDistinctCinemaIdsByMovieAndDate(
                        @Param("movieId") Long movieId,
                        @Param("showDate") LocalDate showDate,
                        Pageable pageable);

        // Query to get all showtimes for a movie at specific cinemas on a date
        @Query("SELECT s FROM Showtime s " +
                        "JOIN fetch s.theater r " +
                        "JOIN fetch r.cinema c " +
                        "WHERE s.movie.id = :movieId " +
                        "AND s.showDate = :showDate " +
                        "AND c.id IN :cinemaIds " +
                        "ORDER BY c.id, s.format, s.startTime")
        List<Showtime> findByMovieDateAndCinemaIds(
                        @Param("movieId") Long movieId,
                        @Param("showDate") LocalDate showDate,
                        @Param("cinemaIds") List<Long> cinemaIds);

        // Count distinct cinemas showing a movie on a date
        @Query("SELECT COUNT(DISTINCT c.id) FROM Showtime s " +
                        "JOIN s.theater r " +
                        "JOIN r.cinema c " +
                        "WHERE s.movie.id = :movieId " +
                        "AND s.showDate = :showDate")
        Long countDistinctCinemasByMovieAndDate(
                        @Param("movieId") Long movieId,
                        @Param("showDate") LocalDate showDate);

        @Query("SELECT DISTINCT s.movie.id FROM Showtime s " +
                        "JOIN s.theater r " +
                        "JOIN r.cinema c " +
                        "WHERE c.id = :cinemaId " +
                        "AND s.showDate = :date " +
                        "ORDER BY s.movie.id")
        Page<Long> findDistinctMovieIdsByCinemaAndDate(Long cinemaId, LocalDate date, Pageable pageable);

        @Query("SELECT s FROM Showtime s " +
                        "JOIN fetch s.theater r " +
                        "JOIN fetch r.cinema c " +
                        "WHERE c.id = :cinemaId " +
                        "AND s.showDate = :date " +
                        "AND s.movie.id IN :movieIds " +
                        "ORDER BY s.movie.id, s.format, s.startTime")
        List<Showtime> findByCinemaDateAndMovieIds(Long cinemaId, LocalDate date, List<Long> movieIds);

}
