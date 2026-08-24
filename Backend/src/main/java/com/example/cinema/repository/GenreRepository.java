package com.example.cinema.repository;

import com.example.cinema.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.Set;

@Repository
public interface GenreRepository extends JpaRepository<Genre, UUID> {
    Set<Genre> findAllByIdIn(Set<UUID> ids);
}
