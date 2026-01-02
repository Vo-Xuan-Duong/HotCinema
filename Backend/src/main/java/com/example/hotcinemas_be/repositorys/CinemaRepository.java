package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Cinema;
import com.example.hotcinemas_be.models.Region;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CinemaRepository extends JpaRepository<Cinema, Long> {

    Optional<Cinema> findByName(String name);

    Page<Cinema> findCinemaByRegion_Slug(String regionSlug, Pageable pageable);

    Page<Cinema> findByIsActiveTrue(Pageable pageable);

    Page<Cinema> findCinemasByRegion_IdAndIsActiveTrue(Long regionId, Pageable pageable);

    String HAVERSINE_FORMULA = "(6371 * acos(cos(radians(:lat)) * cos(radians(c.latitude)) * cos(radians(c.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(c.latitude))))";

    @Query(value = """
        SELECT * FROM cinemas c
        WHERE c.is_active = true
        ORDER BY """ + HAVERSINE_FORMULA + """ 
        ASC
        """,
            countQuery = "SELECT count(*) FROM cinemas c WHERE c.is_active = true",
            nativeQuery = true)
    Page<Cinema> findNearestCinemas(@Param("lat") Double lat, @Param("lng") Double lng, Pageable pageable);

    @Query("SELECT c FROM Cinema c WHERE " +
            "LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.address) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.region) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Cinema> searchCinemas(@Param("keyword") String keyword, Pageable pageable);
}
