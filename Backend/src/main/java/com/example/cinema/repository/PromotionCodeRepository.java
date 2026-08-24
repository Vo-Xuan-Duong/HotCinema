package com.example.cinema.repository;

import com.example.cinema.entity.PromotionCode;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionCodeRepository extends JpaRepository<PromotionCode, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select pc from PromotionCode pc join fetch pc.promotion where upper(pc.code) = upper(:code)")
    Optional<PromotionCode> findByCodeForUpdate(@Param("code") String code);
}
