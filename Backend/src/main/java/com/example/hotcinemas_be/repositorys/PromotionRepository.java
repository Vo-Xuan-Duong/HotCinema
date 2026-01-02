package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Promotion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findPromotionByCode(String code);

    boolean existsPromotionByCode(String code);

    Page<Promotion> findPromotionsByIsActive(Boolean isActive, Pageable pageable);
}
