package com.example.hotcinemas_be.repositorys;

import com.example.hotcinemas_be.models.Region;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegionRepository extends JpaRepository<Region, Long> {
    Optional<Region> findRegionBySlug(String slug);

    Optional<Region> findRegionByName(String name);

    boolean existsRegionBySlug(String slug);

    boolean existsRegionByName(String name);
}
