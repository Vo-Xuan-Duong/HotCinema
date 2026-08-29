package com.example.cinema.repository;

import com.example.cinema.entity.CinemaProduct;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CinemaProductRepository extends JpaRepository<CinemaProduct, UUID> {

    Page<CinemaProduct> findAllByIsActiveTrue(Pageable pageable);

    Optional<CinemaProduct> findByIdAndIsActiveTrue(UUID id);

    @Query("""
            select cp from CinemaProduct cp
            join fetch cp.cinema c
            join fetch cp.product p
            join fetch p.category pc
            where c.id = :cinemaId
              and cp.isActive = true
              and cp.isAvailable = true
              and p.isActive = true
            order by pc.name, p.name
            """)
    List<CinemaProduct> findAvailableByCinemaId(@Param("cinemaId") UUID cinemaId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select cp from CinemaProduct cp
            join fetch cp.cinema c
            join fetch cp.product p
            join fetch p.category pc
            where cp.id = :id
              and cp.isActive = true
            """)
    Optional<CinemaProduct> findByIdForUpdate(@Param("id") UUID id);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            select cp from CinemaProduct cp
            where cp.cinema.id = :cinemaId
              and cp.product.id = :productId
              and cp.isActive = true
            """)
    Optional<CinemaProduct> findByCinemaAndProductForUpdate(
            @Param("cinemaId") UUID cinemaId,
            @Param("productId") UUID productId
    );
}
